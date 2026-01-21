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
    const { phone, otp } = body;

    // Validate required fields
    if (!phone || !otp) {
      return NextResponse.json(
        {
          error: "Phone number and OTP are required",
        },
        { status: 400 },
      );
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      phone,
      type: "phone",
      verified: false,
    }).sort({ createdAt: -1 }); // Get most recent

    if (!otpRecord) {
      return NextResponse.json(
        {
          error: "No OTP found for this phone number",
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
      { phone },
      {
        phoneVerified: true,
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
      message: "Phone verified successfully",
      userId: user._id,
      nextStep: "bvn_verification",
    });
  } catch (error) {
    console.error("Verify phone error:", error);
    return NextResponse.json(
      {
        error: "Phone verification failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
