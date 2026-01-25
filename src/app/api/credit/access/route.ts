// app/api/credit/access/route.ts (REPLACE ENTIRE FILE)
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import { lookupAccount, getBanks } from "@/lib/onepipe/client";
import {
  calculateCreditLimit,
  verifyNameMatch,
} from "@/lib/credit/calculations";
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

    // Check if user is verified
    if (!user.phoneVerified) {
      return NextResponse.json(
        {
          error: "Please verify your phone number first",
        },
        { status: 400 },
      );
    }

    // Check if already accessed credit
    if (user.hasAccessedCredit) {
      return NextResponse.json(
        {
          error: "You have already accessed credit",
          creditData: {
            creditLimit: user.creditLimit,
            availableCredit: user.availableCredit,
          },
        },
        { status: 400 },
      );
    }

    // Check if user has declared salary
    if (!user.monthlySalary || user.monthlySalary < 50000) {
      return NextResponse.json(
        {
          error: "Monthly salary must be at least ₦50,000 to access credit",
        },
        { status: 400 },
      );
    }

    console.log("Starting credit verification for user:", user._id);

    // Step 1: Lookup Account - Verify account name
    console.log("Step 1: Looking up account...");

    const accountResponse = await lookupAccount(
      user.accountNumber,
      user.bankCode,
      {
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    );

    console.log("Account Lookup Response:", accountResponse);

    if (accountResponse.status !== "Successful") {
      return NextResponse.json(
        {
          error: "Failed to verify account details",
          message: accountResponse.message,
          details: accountResponse.data?.errors || accountResponse.data?.error,
        },
        { status: 400 },
      );
    }

    const accountData = accountResponse.data?.provider_response;

    if (!accountData) {
      return NextResponse.json(
        {
          error: "No account data returned from provider",
        },
        { status: 400 },
      );
    }

    // Verify account name matches user's name
    const accountName = accountData.account_name;
    const userName = `${user.firstName} ${user.lastName}`;

    const namesMatch = verifyNameMatch(userName, accountName);

    if (!namesMatch) {
      return NextResponse.json(
        {
          error: "Account name does not match your registered name",
          accountName: accountName,
          registeredName: userName,
          approved: false,
        },
        { status: 400 },
      );
    }

    console.log("✓ Account name verified");

    // Step 2: Get Banks - Verify bank is linked to BVN
    console.log("Step 2: Getting BVN-linked banks...");

    const banksResponse = await getBanks(
      bvn,
      {
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      true, // pwa_enabled_only
    );

    console.log("Get Banks Response:", banksResponse);

    if (banksResponse.status !== "Successful") {
      return NextResponse.json(
        {
          error: "Failed to verify BVN-linked banks",
          message: banksResponse.message,
          details: banksResponse.data?.errors || banksResponse.data?.error,
        },
        { status: 400 },
      );
    }

    const banksData = banksResponse.data?.provider_response;

    if (!banksData || !banksData.banks) {
      return NextResponse.json(
        {
          error: "No banks data returned from provider",
        },
        { status: 400 },
      );
    }

    // Check if user's bank is in the BVN-linked banks list
    const userBankLinked = banksData.banks.some(
      (bank: any) => bank.bank_code === user.bankCode,
    );

    if (!userBankLinked) {
      return NextResponse.json(
        {
          error: "Your bank account is not linked to this BVN",
          message:
            "Please ensure your bank account is registered with your BVN",
          approved: false,
        },
        { status: 400 },
      );
    }

    console.log("✓ Bank verified as BVN-linked and PWA-enabled");

    // Step 3: Calculate credit limit (35% of declared salary, max ₦100K)
    const creditLimit = calculateCreditLimit(user.monthlySalary);

    console.log("Credit limit calculated:", creditLimit);

    // Step 4: Update user in database
    await User.updateOne(
      { _id: userId },
      {
        hasAccessedCredit: true,
        bvnVerified: true,
        bvn: maskBVN(bvn),
        creditLimit: creditLimit,
        availableCredit: creditLimit,
        accountName: accountName,
        maxSingleDebit: creditLimit,
        status: "verified",
      },
    );

    console.log("✓ User updated with credit access");

    // Step 5: Return success response
    return NextResponse.json({
      success: true,
      approved: true,
      message: "Credit access approved",
      creditData: {
        creditLimit: creditLimit,
        availableCredit: creditLimit,
        declaredSalary: user.monthlySalary,
        accountName: accountName,
        accountNumber: user.accountNumber,
        bankName: user.bankName,
        maxSingleDebit: creditLimit,
      },
    });
  } catch (error: any) {
    console.error("Access credit error:", error);
    return NextResponse.json(
      {
        error: "Credit access failed. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
