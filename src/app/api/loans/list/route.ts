// app/api/loans/list/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Loan from "@/models/loan";
import Payment from "@/models/payment";

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

    // Get all loans for user
    const loans = await Loan.find({ userId }).sort({ createdAt: -1 }).lean();

    // Get payments for each loan
    const loansWithPayments = await Promise.all(
      loans.map(async (loan) => {
        const payments = await Payment.find({ loanId: loan._id }).lean();

        return {
          ...loan,
          payments: payments.map((p) => ({
            id: p._id,
            paymentNumber: p.paymentNumber,
            dueDate: p.dueDate,
            amount: p.amount,
            status: p.status,
            paidDate: p.paidDate,
            transactionRef: p.transactionRef,
          })),
        };
      }),
    );

    return NextResponse.json({
      success: true,
      loans: loansWithPayments,
    });
  } catch (error: any) {
    console.error("Get loans error:", error);
    return NextResponse.json(
      {
        error: "Failed to get loans",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
