/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/send-otp/route.ts
import { NextResponse } from 'next/server';
import User from '@/models/user';
import OTP from '@/models/otp';
import { generateOTP, getOTPExpiration } from '@/lib/utils/otp';
import connectDB from '../../lib/mongodb';
import { sendEmail } from '../../lib/email';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          error: 'email is required',
        },
        { status: 400 },
      );
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found',
        },
        { status: 404 },
      );
    }

    // Generate new OTP
    const otp = generateOTP(6);
    const expiresAt = getOTPExpiration();

    // Delete old OTPs for this phone
    await OTP.deleteMany({ email: email, type: 'email' });

    // Save new OTP
    await OTP.create({
      email: email,
      otp,
      type: 'email',
      verified: false,
      expiresAt,
    });

    await sendEmail({
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
      text: `Your OTP for email verification is: ${otp}`,
    });

    // TODO: Send OTP via mail provider
    console.log(`OTP for ${email}: ${otp}`);
    // await sendSMS(formattedPhone, `Your Everything Credit OTP is: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // For demo only - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send OTP',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
