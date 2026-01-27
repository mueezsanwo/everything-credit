/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { validateBVNOTP } from '@/lib/onepipe/client';
import { getUserFromRequest } from '../../lib/getUserFromRequest';
import connectDB from '@/app/api/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  await connectDB();

  // ✅ Get authenticated user ID
  const userId = await getUserFromRequest();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ Fetch user
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { otp } = await request.json();

  if (!otp) {
    return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
  }

  // ✅ Get transaction ref saved during BVN lookup
  const transactionRef = user.bvnTransactionRef;

  if (!transactionRef) {
    return NextResponse.json(
      { error: 'No BVN verification in progress' },
      { status: 400 },
    );
  }

  try {
    const bvnData = await validateBVNOTP(otp, transactionRef);

    // ✅ Mark BVN as verified
    user.bvnVerified = true;
    user.status = 'verified'; // or next logical status
    user.bvnTransactionRef = undefined; // cleanup
    user.bvn = bvnData.bvn; // Save the verified BVN

    await user.save();

    return NextResponse.json(
      {
        message: 'BVN OTP validated successfully',
        bvnData,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error validating BVN OTP:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to validate BVN OTP' },
      { status: 500 },
    );
  }
}
