/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import connectDB from '@/app/api/lib/mongodb';
import { getUserFromRequest } from '@/app/api/lib/getUserFromRequest';
import User from '@/models/user';
import { collect } from '@/lib/onepipe/client';

export async function POST(request: Request) {
  await connectDB();

  const userId = await getUserFromRequest();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.hasMandateCreated !== true) {
    return NextResponse.json(
      { error: 'only accounts with mandate can recieve collect' },
      { status: 400 },
    );
  }

  const { amount, narration } = await request.json();

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: 'Valid amount is required' },
      { status: 400 },
    );
  }

  if (amount > user.availableCredit * 100) {
    return NextResponse.json(
      { error: 'Amount exceeds available credit' },
      { status: 400 },
    );
  }

  try {
    const customer = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    };

    const response = await collect(
      user.accountNumber!,
      user.bankCode!,
      amount,
      customer,
      narration || 'Loan repayment',
    );

    // ✅ Only deduct after success
    if (response?.data?.provider_response_code === '00') {
      user.availableCredit -= amount / 100;
      await user.save();
    }

    return NextResponse.json(
      {
        message: 'Debit initiated successfully',
        response,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Collect error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to collect payment' },
      { status: 500 },
    );
  }
}
