// app/api/auth/send-otp/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import OTP from "@/models/otp";
import { generateOTP, getOTPExpiration } from "@/lib/utils/otp";
import { formatPhoneNumber } from "@/lib/utils/validation";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        {
          error: "Phone number is required",
        },
        { status: 400 },
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Check if user exists
    const user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 },
      );
    }

    // Generate new OTP
    const otp = generateOTP(6);
    const expiresAt = getOTPExpiration();

    // Delete old OTPs for this phone
    await OTP.deleteMany({ phone: formattedPhone, type: "phone" });

    // Save new OTP
    await OTP.create({
      phone: formattedPhone,
      email: user.email,
      otp,
      type: "phone",
      verified: false,
      expiresAt,
    });

    // TODO: Send OTP via SMS provider
    console.log(`OTP for ${formattedPhone}: ${otp}`);
    // await sendSMS(formattedPhone, `Your Everything Credit OTP is: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // For demo only - remove in production
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      {
        error: "Failed to send OTP",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
