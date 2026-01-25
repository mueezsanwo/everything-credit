// app/api/payments/upcoming/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/payment";
import Loan from "@/models/loan";
import Purchase from "@/models/purchase";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required",
        },
        { status: 400 },
      );
    }

    // Get upcoming pending payments (next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const upcomingPayments = await Payment.find({
      userId,
      status: "pending",
      dueDate: { $gte: today, $lte: thirtyDaysLater },
    })
      .sort({ dueDate: 1 })
      .lean();

    // Enrich with parent loan/purchase info
    const enrichedPayments = await Promise.all(
      upcomingPayments.map(async (payment) => {
        let itemName = "Unknown";
        let itemType = "unknown";

        if (payment.loanId) {
          const loan = await Loan.findById(payment.loanId);
          if (loan) {
            itemName = loan.name;
            itemType = "loan";
          }
        } else if (payment.purchaseId) {
          const purchase = await Purchase.findById(payment.purchaseId);
          if (purchase) {
            itemName = purchase.items.map((i) => i.name).join(", ");
            itemType = "purchase";
          }
        }

        return {
          id: payment._id,
          paymentNumber: payment.paymentNumber,
          dueDate: payment.dueDate,
          amount: payment.amount,
          status: payment.status,
          itemName,
          itemType,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      upcomingPayments: enrichedPayments,
    });
  } catch (error: any) {
    console.error("Get upcoming payments error:", error);
    return NextResponse.json(
      {
        error: "Failed to get upcoming payments",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
