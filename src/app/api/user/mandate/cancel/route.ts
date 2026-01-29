/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import User from '@/models/user';
import Payment from '@/models/payment';
import { cancelMandate } from '@/lib/onepipe/client';
import { getUserFromRequest } from '@/app/api/lib/getUserFromRequest';
import connectDB from '@/app/api/lib/mongodb';

export async function POST() {
  try {
    await connectDB();

    /* ---------- AUTH ---------- */
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

        console.log(
          'User mandateSubscription_id:',
          user.mandateSubscription_id,
        );
        console.log('User mandateStatus:', user.hasMandateCreated);
    /* ---------- VALIDATE MANDATE ---------- */
    if (!user.hasMandateCreated || !user.mandateSubscription_id) {
      return NextResponse.json(
        { error: 'No active mandate found' },
        { status: 400 },
      );
    }


    /* ---------- CHECK PENDING PAYMENTS ---------- */
    const pendingPayments = await Payment.countDocuments({
      userId: user._id,
      status: 'pending',
    });

    if (pendingPayments > 0) {
      return NextResponse.json(
        {
          error:
            'You have pending payments. Complete them before cancelling mandate.',
        },
        { status: 400 },
      );
    }

    /* ---------- CALL ONEPIPE ---------- */
    const response = await cancelMandate(user.mandateSubscription_id, {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });

    if (response.status !== 'Successful') {
      return NextResponse.json(
        {
          error: 'Mandate cancellation failed',
          message: response.message,
        },
        { status: 400 },
      );
    }

    /* ---------- UPDATE USER ---------- */
    user.mandateStatus = 'CANCELLED';
    user.hasMandateCreated = false;
    user.mandateSubscription_id = "";
    user.mandateRef = "";

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Mandate cancelled successfully',
    });
  } catch (error: any) {
    console.error('Cancel mandate error:', error);

    return NextResponse.json(
      {
        error: 'Failed to cancel mandate',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
