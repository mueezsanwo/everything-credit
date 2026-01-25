// app/api/auth/verify-phone/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { isOTPExpired } from "@/lib/utils/otp";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, otp } = body;

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        {
          error: "Email and OTP are required",
        },
        { status: 400 },
      );
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email,
      type: "email",
      verified: false,
    }).sort({ createdAt: -1 }); // Get most recent

    if (!otpRecord) {
      return NextResponse.json(
        {
          error: "No OTP found for this email. Please request a new one.",
        },
        { status: 404 },
      );
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      return NextResponse.json(
        {
          error: "OTP has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        {
          error: "Invalid OTP. Please try again.",
        },
        { status: 400 },
      );
    }

    // Mark OTP as verified
    await OTP.updateOne({ _id: otpRecord._id }, { verified: true });

    // Update user status
    const user = await User.findOneAndUpdate(
      { email },
      {
        emailVerified: true,
        status: "pending_bvn_verification",
      },
      { new: true },
    );

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "email verified successfully",
      userId: user._id,
      nextStep: "bvn_verification",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      {
        error: "email verification failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
