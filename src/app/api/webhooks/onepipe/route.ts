// app/api/webhooks/onepipe/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Webhook from "@/models/webhook";
import Payment from "@/models/payment";
import Loan from "@/models/loan";
import Purchase from "@/models/purchase";
import User from "@/models/user";
import { verifyWebhookSignature } from "@/lib/onepipe/encryption";
import {
  shouldTriggerDelivery,
  areAllPaymentsCompleted,
} from "@/lib/payments/scheduler";

const APP_SECRET = process.env.ONEPIPE_APP_SECRET!;

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Get signature from headers
    const signature = request.headers.get("Signature");
    const body = await request.json();

    console.log("Webhook received:", body);

    // Verify signature
    if (
      !signature ||
      !verifyWebhookSignature(body.request_ref, signature, APP_SECRET)
    ) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        {
          error: "Invalid signature",
        },
        { status: 401 },
      );
    }

    // Log webhook to database
    const webhookLog = await Webhook.create({
      requestRef: body.request_ref,
      requestType: body.request_type,
      provider: body.details?.provider,
      transactionRef: body.details?.transaction_ref,
      transactionType: body.details?.transaction_type,
      status: body.details?.status,
      amount: body.details?.amount,
      customerRef: body.details?.customer_ref,
      payload: body,
      processed: false,
    });

    // Handle different webhook types
    const { request_type, details } = body;

    if (request_type === "transaction_notification") {
      await handleTransactionNotification(details, webhookLog._id);
    }

    return NextResponse.json({
      status: "Successful",
      message: "Webhook received and processed",
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * Handle transaction notification webhooks
 */
async function handleTransactionNotification(details: any, webhookId: any) {
  const {
    transaction_type,
    transaction_ref,
    status,
    amount,
    customer_ref,
    meta,
  } = details;

  console.log("Processing transaction notification:", {
    type: transaction_type,
    ref: transaction_ref,
    status,
  });

  // Handle payment collection (collect)
  if (transaction_type === "collect" && meta?.event_type === "debit") {
    await handlePaymentCollection(
      transaction_ref,
      status,
      amount,
      meta,
      webhookId,
    );
  }

  // Handle mandate activation
  if (transaction_type === "activate_mandate") {
    await handleMandateActivation(customer_ref, status, details, webhookId);
  }

  // Handle disbursement confirmation
  if (transaction_type === "disburse") {
    await handleDisbursement(transaction_ref, status, webhookId);
  }
}

/**
 * Handle payment collection webhook
 */
async function handlePaymentCollection(
  transactionRef: string,
  status: string,
  amount: number,
  meta: any,
  webhookId: any,
) {
  try {
    // Find payment by transaction ref
    const payment = await Payment.findOne({ transactionRef });

    if (!payment) {
      console.warn("Payment not found for transaction:", transactionRef);
      return;
    }

    if (status === "Successful") {
      // Mark payment as paid
      await Payment.updateOne(
        { _id: payment._id },
        {
          status: "paid",
          paidDate: new Date(),
          transactionRef: meta?.payment_id || transactionRef,
        },
      );

      console.log("Payment marked as paid:", payment._id);

      // Update user's available credit (give back the monthly payment)
      await User.updateOne(
        { _id: payment.userId },
        { $inc: { availableCredit: payment.amount } },
      );

      // Check if loan is completed
      if (payment.loanId) {
        await checkAndCompleteLoan(payment.loanId);
      }

      // Check if purchase is completed or ready for delivery
      if (payment.purchaseId) {
        await checkAndUpdatePurchase(payment.purchaseId);
      }

      // Mark webhook as processed
      await Webhook.updateOne({ _id: webhookId }, { processed: true });
    } else {
      // Payment failed - mark as failed and schedule retry
      await Payment.updateOne(
        { _id: payment._id },
        {
          status: "failed",
          failureReason: details?.data?.error || "Payment failed",
          $inc: { retryCount: 1 },
          lastRetryAt: new Date(),
        },
      );

      console.error("Payment failed:", payment._id);
    }
  } catch (error) {
    console.error("Error handling payment collection:", error);
  }
}

/**
 * Handle mandate activation webhook
 */
async function handleMandateActivation(
  customerRef: string,
  status: string,
  details: any,
  webhookId: any,
) {
  try {
    if (status === "Successful") {
      const user = await User.findOne({ phone: customerRef });

      if (user) {
        await User.updateOne(
          { _id: user._id },
          {
            mandateStatus: "active",
            mandateActivatedAt: new Date(),
          },
        );

        console.log("Mandate activated for user:", user._id);

        // Mark webhook as processed
        await Webhook.updateOne({ _id: webhookId }, { processed: true });
      }
    }
  } catch (error) {
    console.error("Error handling mandate activation:", error);
  }
}

/**
 * Handle disbursement confirmation webhook
 */
async function handleDisbursement(
  transactionRef: string,
  status: string,
  webhookId: any,
) {
  try {
    if (status === "Successful") {
      // Find loan by transaction ref
      const loan = await Loan.findOne({ transactionRef });

      if (loan && loan.status === "pending") {
        await Loan.updateOne(
          { _id: loan._id },
          {
            status: "active",
            disbursedAt: new Date(),
          },
        );

        console.log("Loan disbursement confirmed:", loan._id);

        // Mark webhook as processed
        await Webhook.updateOne({ _id: webhookId }, { processed: true });
      }
    }
  } catch (error) {
    console.error("Error handling disbursement:", error);
  }
}

/**
 * Check if loan is fully paid and mark as completed
 */
async function checkAndCompleteLoan(loanId: any) {
  try {
    const payments = await Payment.find({ loanId });
    const allPaid = areAllPaymentsCompleted(payments);

    if (allPaid) {
      await Loan.updateOne(
        { _id: loanId },
        {
          status: "completed",
          completedAt: new Date(),
        },
      );

      console.log("Loan completed:", loanId);
    }
  } catch (error) {
    console.error("Error checking loan completion:", error);
  }
}

/**
 * Check purchase payment progress and update delivery status
 */
async function checkAndUpdatePurchase(purchaseId: any) {
  try {
    const payments = await Payment.find({ purchaseId });
    const totalPayments = payments.length;
    const paidPayments = payments.filter((p) => p.status === "paid").length;
    const percentPaid = (paidPayments / totalPayments) * 100;

    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) return;

    // Update delivery status based on payment progress
    if (percentPaid >= 100) {
      await Purchase.updateOne(
        { _id: purchaseId },
        {
          status: "completed",
          deliveryStatus: "delivered",
          deliveredAt: new Date(),
        },
      );
      console.log("Purchase completed and delivered:", purchaseId);
    } else if (
      percentPaid >= 50 &&
      purchase.deliveryStatus === "pending_payment"
    ) {
      await Purchase.updateOne(
        { _id: purchaseId },
        { deliveryStatus: "in_transit" },
      );
      console.log("Purchase ready for delivery (50% paid):", purchaseId);
    }
  } catch (error) {
    console.error("Error updating purchase:", error);
  }
}
