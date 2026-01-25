// app/api/auth/validate-bvn-otp/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import { validateBVNOTP } from "@/lib/onepipe/client";
import { verifyNameMatch } from "@/lib/credit/calculations";
import { maskBVN } from "@/lib/utils/validation";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, otp, provider, transactionRef, bvn } = body;

    // Validate required fields
    if (!userId || !otp || !provider || !transactionRef) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 },
      );
    }

    // Validate BVN OTP with OnePipe
    const otpResponse = await validateBVNOTP(otp, provider, transactionRef);

    console.log("BVN OTP Response:", otpResponse);

    // Handle failure
    if (otpResponse.status !== "Successful") {
      return NextResponse.json(
        {
          error: otpResponse.message || "Invalid OTP",
          details: otpResponse.data?.errors || otpResponse.data?.error,
        },
        { status: 400 },
      );
    }

    // Extract BVN data
    const bvnData = otpResponse.data?.provider_response;

    if (!bvnData) {
      return NextResponse.json(
        {
          error: "No BVN data returned from provider",
        },
        { status: 400 },
      );
    }

    // Verify name match
    const bvnName =
      `${bvnData.first_name || ""} ${bvnData.last_name || ""}`.trim();
    const userName = `${user.firstName} ${user.lastName}`;

    const namesMatch = verifyNameMatch(userName, bvnName);

    if (!namesMatch) {
      return NextResponse.json(
        {
          error: "BVN name does not match your registered name",
          bvnName: bvnName,
          registeredName: userName,
        },
        { status: 400 },
      );
    }

    // Update user with BVN verification
    await User.updateOne(
      { _id: userId },
      {
        bvnVerified: true,
        bvn: maskBVN(bvn), // Store masked BVN
        status: "verified",
      },
    );

    return NextResponse.json({
      success: true,
      message: "BVN verified successfully",
      bvnData: {
        firstName: bvnData.first_name,
        lastName: bvnData.last_name,
        dateOfBirth: bvnData.date_of_birth,
        phoneNumber: bvnData.phone_number,
      },
    });
  } catch (error: any) {
    console.error("Validate BVN OTP error:", error);
    return NextResponse.json(
      {
        error: "OTP validation failed. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
