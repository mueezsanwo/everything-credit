/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

import User from '@/models/User';
import Purchase from '@/models/Purchase';
import Payment from '@/models/Payment';

import connectDB from '@/app/api/lib/mongodb';
import { getUserFromRequest } from '@/app/api/lib/getUserFromRequest';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const { id } = await params;

    console.log('Incoming ID:', id);

    /* ---------- ADMIN AUTH CHECK ---------- */
    const admin = await getUserFromRequest();

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    /* ---------- VALIDATE OBJECT ID ---------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    /* ---------- FETCH TARGET USER ---------- */
    const targetUser = await User.findById(id).select('-password').lean();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    /* ---------- FETCH PURCHASES ---------- */
    const purchases = await Purchase.find({
      userId: targetUser._id,
    }).lean();

    /* ---------- ENRICH PURCHASES ---------- */
    const purchaseDetails = await Promise.all(
      purchases.map(async (purchase: any) => {
        const payments = await Payment.find({
          purchaseId: purchase._id,
        }).lean();

        const totalPaid = payments
          .filter((p: any) => p.status === 'paid')
          .reduce((sum: number, p: any) => sum + p.amount, 0);

        const remainingBalance = payments
          .filter((p: any) => p.status === 'pending')
          .reduce((sum: number, p: any) => sum + p.amount, 0);

        return {
          ...purchase,
          payments,
          totalInstallments: payments.length,
          totalPaid,
          remainingBalance,
        };
      }),
    );

    /* ---------- RESPONSE ---------- */
    return NextResponse.json({
      success: true,
      user: {
        ...targetUser,
        purchases: purchaseDetails,
      },
    });
  } catch (error: any) {
    console.error('Admin get user error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch user',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
