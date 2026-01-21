// app/api/auth/verify-bvn/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { lookupBVN } from "@/lib/onepipe/client";
import { verifyNameMatch } from "@/lib/credit/calculations";
import { isValidBVN, maskBVN } from "@/lib/utils/validation";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, bvn } = body;

    // Validate required fields
    if (!userId || !bvn) {
      return NextResponse.json(
        {
          error: "User ID and BVN are required",
        },
        { status: 400 },
      );
    }

    // Validate BVN format
    if (!isValidBVN(bvn)) {
      return NextResponse.json(
        {
          error: "Invalid BVN. Must be 11 digits.",
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

    // Check if phone is verified
    if (!user.phoneVerified) {
      return NextResponse.json(
        {
          error: "Please verify your phone number first",
        },
        { status: 400 },
      );
    }

    // Call OnePipe BVN Lookup
    const bvnResponse = await lookupBVN(bvn, {
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

    console.log("BVN Response:", bvnResponse);

    // Handle OTP requirement
    if (
      bvnResponse.status === "WaitingForOTP" ||
      bvnResponse.status === "PendingValidation"
    ) {
      return NextResponse.json({
        success: false,
        requiresOTP: true,
        message: bvnResponse.message,
        provider: bvnResponse.data?.provider,
        transactionRef: bvnResponse.data?.provider_response?.transaction_ref,
      });
    }

    // Handle failure
    if (bvnResponse.status !== "Successful") {
      return NextResponse.json(
        {
          error: bvnResponse.message || "BVN verification failed",
          details: bvnResponse.data?.errors || bvnResponse.data?.error,
        },
        { status: 400 },
      );
    }

    // Extract BVN data
    const bvnData = bvnResponse.data?.provider_response;

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
    console.error("Verify BVN error:", error);
    return NextResponse.json(
      {
        error: "BVN verification failed. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
