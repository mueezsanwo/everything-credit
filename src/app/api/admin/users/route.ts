/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import User from '@/models/User';
import Purchase from '@/models/Purchase';
import Payment from '@/models/Payment';
import connectDB from '../../lib/mongodb';
import { getUserFromRequest } from '../../lib/getUserFromRequest';

export async function GET() {
  try {
    await connectDB();
        const user = await getUserFromRequest();
        if (!user || user.role !== 'admin') {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

    const users = await User.find().lean();

    const results = await Promise.all(
      users.map(async (user) => {
        const purchases = await Purchase.find({
          userId: user._id,
        }).lean();

        const purchaseSummaries = await Promise.all(
          purchases.map(async (purchase) => {
            const payments = await Payment.find({
              purchaseId: purchase._id,
            }).lean();

            const totalPaid = payments
              .filter((p) => p.status === 'paid')
              .reduce((sum, p) => sum + p.amount, 0);

            const totalOutstanding = payments
              .filter((p) => p.status === 'pending')
              .reduce((sum, p) => sum + p.amount, 0);

            return {
              purchaseId: purchase.purchaseId,
              totalRepayment: purchase.totalRepayment,
              installments: purchase.installments,
              monthlyPayment: purchase.monthlyPayment,
              totalPaid,
              totalOutstanding,
            };
          }),
        );

        return {
          _id: user._id,
          name: user.firstName + ' ' + user.lastName,
          email: user.email,
          availableCredit: user.availableCredit,
          purchases: purchaseSummaries,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      users: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
