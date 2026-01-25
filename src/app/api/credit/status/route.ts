// app/api/credit/status/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
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

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 },
      );
    }

    // Get active loans
    const activeLoans = await Loan.find({
      userId,
      status: "active",
    });

    // Get active purchases
    const activePurchases = await Purchase.find({
      userId,
      status: "active",
    });

    // Calculate totals
    const totalLoanAmount = activeLoans.reduce(
      (sum, loan) => sum + loan.amount,
      0,
    );
    const totalPurchaseMonthly = activePurchases.reduce(
      (sum, purchase) => sum + purchase.monthlyPayment,
      0,
    );

    return NextResponse.json({
      success: true,
      creditStatus: {
        hasAccessedCredit: user.hasAccessedCredit,
        creditLimit: user.creditLimit,
        availableCredit: user.availableCredit,
        verifiedSalary: user.verifiedSalary,
        maxSingleDebit: user.maxSingleDebit,
        activeLoansCount: activeLoans.length,
        activePurchasesCount: activePurchases.length,
        totalLoanAmount,
        totalPurchaseMonthly,
        mandateStatus: user.mandateStatus,
        hasMandateCreated: user.hasMandateCreated,
      },
    });
  } catch (error: any) {
    console.error("Get credit status error:", error);
    return NextResponse.json(
      {
        error: "Failed to get credit status",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
