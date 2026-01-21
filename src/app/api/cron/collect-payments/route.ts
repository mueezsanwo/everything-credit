// app/api/cron/collect-payments/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { collect } from "@/lib/onepipe/client";

const CRON_SECRET = process.env.CRON_SECRET!;

export async function GET(request: Request) {
  try {
    // Verify cron secret (from Vercel Cron or manual trigger)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await dbConnect();

    // Find all pending payments due today or overdue
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const duePayments = await Payment.find({
      status: "pending",
      dueDate: { $lte: today },
    }).populate("userId");

    console.log(`Found ${duePayments.length} due payments`);

    const results = {
      total: duePayments.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as any[],
    };

    // Process each payment
    for (const payment of duePayments) {
      try {
        const user = payment.userId as any;

        if (!user) {
          results.skipped++;
          results.errors.push({
            paymentId: payment._id,
            error: "User not found",
          });
          continue;
        }

        // Skip if user doesn't have mandate
        if (!user.hasMandateCreated || !user.mandateToken) {
          results.skipped++;
          results.errors.push({
            paymentId: payment._id,
            error: "No mandate token",
            userId: user._id,
          });
          continue;
        }

        // Skip if mandate is not active
        if (user.mandateStatus !== "active") {
          results.skipped++;
          results.errors.push({
            paymentId: payment._id,
            error: "Mandate not active",
            userId: user._id,
          });
          continue;
        }

        console.log(`Collecting payment ${payment._id} for user ${user._id}`);

        // Collect payment via OnePipe
        const collectResponse = await collect(
          user.mandateToken,
          payment.amount * 100, // Convert to kobo
          {
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          `Payment ${payment.paymentNumber} - ${payment.loanId ? "Loan Repayment" : "Purchase Installment"}`,
        );

        console.log("Collect response:", collectResponse);

        // Update payment with transaction ref
        await Payment.updateOne(
          { _id: payment._id },
          {
            transactionRef:
              collectResponse.data?.provider_response?.reference ||
              "COL" + Date.now(),
          },
        );

        if (collectResponse.status === "Successful") {
          results.successful++;
          console.log("Payment collection initiated:", payment._id);
          // Note: Webhook will handle marking as paid
        } else {
          results.failed++;
          await Payment.updateOne(
            { _id: payment._id },
            {
              status: "failed",
              failureReason: collectResponse.message || "Collection failed",
              $inc: { retryCount: 1 },
              lastRetryAt: new Date(),
            },
          );

          results.errors.push({
            paymentId: payment._id,
            error: collectResponse.message,
          });
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          paymentId: payment._id,
          error: error.message,
        });
        console.error("Error collecting payment:", error);
      }
    }

    console.log("Payment collection results:", results);

    return NextResponse.json({
      success: true,
      message: "Payment collection completed",
      results: {
        total: results.total,
        successful: results.successful,
        failed: results.failed,
        skipped: results.skipped,
        errors: results.errors,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
