/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payments/collect-now/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/payment';
import User from '@/models/user';
import { collect } from '@/lib/onepipe/client';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        {
          error: 'Payment ID is required',
        },
        { status: 400 },
      );
    }

    // Find payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return NextResponse.json(
        {
          error: 'Payment not found',
        },
        { status: 404 },
      );
    }

    if (payment.status === 'paid') {
      return NextResponse.json(
        {
          error: 'Payment already completed',
        },
        { status: 400 },
      );
    }

    // Find user
    const user = await User.findById(payment.userId);

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found',
        },
        { status: 404 },
      );
    }

    // Check mandate
    if (!user.hasMandateCreated) {
      return NextResponse.json(
        {
          error: 'No mandate token available',
        },
        { status: 400 },
      );
    }

    // Check for subscription_id (mandateSubscription_id in DB)
    if (!user.mandateSubscription_id) {
      return NextResponse.json(
        {
          error: 'No mandate subscription ID available',
        },
        { status: 400 },
      );
    }

    // Collect payment with subscription_id
    const collectResponse = await collect(
      user.accountNumber!,
      user.bankCode!,
      payment.amount * 100, // Convert to kobo
      {
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      `Manual Payment Collection - Payment ${payment.paymentNumber}`,
      user.mandateSubscription_id, // Pass subscription_id as 6th parameter
    );

    console.log('Collect response:', collectResponse.data.error);
    console.log('Collect response:', collectResponse.data.errors);

    // Update payment with transaction ref
    await Payment.updateOne(
      { _id: payment._id },
      {
        transactionRef:
          collectResponse.data?.provider_response?.reference ||
          'COL' + Date.now(),
      },
    );

    if (collectResponse.status === 'Successful') {
      return NextResponse.json({
        success: true,
        message: 'Payment collection initiated successfully',
        transactionRef: collectResponse.data?.provider_response?.reference,
      });
    } else {
      return NextResponse.json(
        {
    success: false,
    error: 'Payment collection failed',
    message: collectResponse.message || 'Transaction failed',
    details: collectResponse.data?.errors || 
             (collectResponse.data?.error ? [collectResponse.data.error] : []),
    
  },
  { status: 400 },
      );
    }
  } catch (error: any) {
    console.error('Collect now error:', error);
    return NextResponse.json(
      {
        error: 'Failed to collect payment',
        details: error.message,
      },
      { status: 500 },
    );
  }
}