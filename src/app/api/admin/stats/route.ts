// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import Loan from "@/models/loan";
import Purchase from "@/models/purchase";
import Payment from "@/models/payment";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // TODO: Add admin authentication check

    // Get stats
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ status: "verified" });
    const usersWithCredit = await User.countDocuments({
      hasAccessedCredit: true,
    });

    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: "active" });

    const totalPurchases = await Purchase.countDocuments();
    const activePurchases = await Purchase.countDocuments({ status: "active" });

    const allLoans = await Loan.find();
    const totalDisbursed = allLoans.reduce((sum, loan) => sum + loan.amount, 0);

    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const allPendingPayments = await Payment.find({ status: "pending" });
    const totalOutstanding = allPendingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        usersWithCredit,
        totalLoans,
        activeLoans,
        totalPurchases,
        activePurchases,
        totalDisbursed,
        totalOutstanding,
        pendingPayments,
      },
    });
  } catch (error: any) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
