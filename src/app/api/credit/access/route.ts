// app/api/credit/access/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getStatement } from "@/lib/onepipe/client";
import {
  verifySalary,
  calculateCreditLimit,
  verifyNameMatch,
} from "@/lib/credit/calculations";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required",
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
    if (!user.bvnVerified) {
      return NextResponse.json(
        {
          error: "Please verify your BVN first",
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
            verifiedSalary: user.verifiedSalary,
          },
        },
        { status: 400 },
      );
    }

    // Step 1: Get bank statement (last 3 months)
    const endDate = new Date().toISOString().split("T")[0]; // Today
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // 3 months ago
    const startDateStr = startDate.toISOString().split("T")[0];

    console.log("Fetching statement from", startDateStr, "to", endDate);

    const statementResponse = await getStatement(
      user.accountNumber,
      user.bankCode,
      startDateStr,
      endDate,
      {
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    );

    console.log("Statement Response:", statementResponse);

    // Handle failure
    if (statementResponse.status !== "Successful") {
      return NextResponse.json(
        {
          error: "Failed to retrieve bank statement",
          message: statementResponse.message,
          details:
            statementResponse.data?.errors || statementResponse.data?.error,
        },
        { status: 400 },
      );
    }

    const providerResponse = statementResponse.data?.provider_response;

    if (!providerResponse) {
      return NextResponse.json(
        {
          error: "No statement data returned from provider",
        },
        { status: 400 },
      );
    }

    // Step 2: Verify account name matches BVN name
    const accountName = providerResponse.client_info?.name;

    if (!accountName) {
      return NextResponse.json(
        {
          error: "Could not retrieve account name from statement",
        },
        { status: 400 },
      );
    }

    const userName = `${user.firstName} ${user.lastName}`;
    const namesMatch = verifyNameMatch(userName, accountName);

    if (!namesMatch) {
      return NextResponse.json(
        {
          error: "Account name does not match your BVN name",
          accountName: accountName,
          bvnName: userName,
          approved: false,
        },
        { status: 400 },
      );
    }

    // Step 3: Verify salary from transactions
    const transactions = providerResponse.statement_list || [];

    if (transactions.length === 0) {
      return NextResponse.json(
        {
          error: "No transactions found in your bank statement",
          approved: false,
        },
        { status: 400 },
      );
    }

    const salaryVerification = verifySalary(transactions);

    if (!salaryVerification.verified) {
      return NextResponse.json(
        {
          error: "Unable to verify salary",
          reason: salaryVerification.reason,
          approved: false,
        },
        { status: 400 },
      );
    }

    // Step 4: Calculate credit limit
    const creditLimit = calculateCreditLimit(salaryVerification.verifiedSalary);

    // Step 5: Update user in database
    await User.updateOne(
      { _id: userId },
      {
        hasAccessedCredit: true,
        creditLimit: creditLimit,
        availableCredit: creditLimit,
        verifiedSalary: salaryVerification.verifiedSalary,
        accountName: accountName,
        maxSingleDebit: creditLimit,
      },
    );

    // Step 6: Return success response
    return NextResponse.json({
      success: true,
      approved: true,
      message: "Credit access approved",
      creditData: {
        creditLimit: creditLimit,
        availableCredit: creditLimit,
        verifiedSalary: salaryVerification.verifiedSalary,
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
