/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/user';
import Purchase from '@/models/purchase';
import Payment from '@/models/payment';
import connectDB from '@/app/api/lib/mongodb';
import { getUserFromRequest } from '@/app/api/lib/getUserFromRequest';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await getUserFromRequest();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const userId = await User.findById(id).lean();

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const purchases = await Purchase.find({
      userId: userId,
    }).lean();

    const purchaseDetails = await Promise.all(
      purchases.map(async (purchase) => {
        const payments = await Payment.find({
          purchaseId: purchase._id,
        }).lean();

        const paid = payments.filter((p) => p.status === 'paid');

        const pending = payments.filter((p) => p.status === 'pending');

        const totalPaid = paid.reduce((sum, p) => sum + p.amount, 0);

        const remainingBalance = pending.reduce((sum, p) => sum + p.amount, 0);

        return {
          ...purchase,
          payments,
          totalPaid,
          remainingBalance,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        purchases: purchaseDetails,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
