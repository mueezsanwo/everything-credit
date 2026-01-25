// app/api/loans/apply/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import Loan from "@/models/loan";
import Payment from "@/models/payment";
import { createMandate, disburse } from "@/lib/onepipe/client";
import { calculateLoanDetails } from "@/lib/credit/calculations";
import { generateLoanPayment } from "@/lib/payments/scheduler";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, amount, purpose } = body;

    // Validate required fields
    if (!userId || !amount) {
      return NextResponse.json(
        {
          error: "User ID and amount are required",
        },
        { status: 400 },
      );
    }

    // Parse amount
    const loanAmount = parseInt(amount);

    if (isNaN(loanAmount) || loanAmount < 5000 || loanAmount > 500000) {
      return NextResponse.json(
        {
          error: "Loan amount must be between ₦5,000 and ₦500,000",
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

    // Check if user has accessed credit
    if (!user.hasAccessedCredit) {
      return NextResponse.json(
        {
          error: "Please access your credit limit first",
        },
        { status: 400 },
      );
    }

    // Check available credit
    if (loanAmount > user.availableCredit) {
      return NextResponse.json(
        {
          error: `Amount exceeds your available credit of ₦${user.availableCredit.toLocaleString()}`,
        },
        { status: 400 },
      );
    }

    // Step 1: Create mandate if first time
    if (!user.hasMandateCreated) {
      console.log("Creating mandate for user:", user._id);

      const mandateResponse = await createMandate(
        user.accountNumber,
        user.bankCode,
        user.maxSingleDebit * 100, // Convert to kobo
        user.bvn.replace(/\*/g, ""), // Remove masking (store original BVN temporarily)
        {
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        null, // consentPDF - optional
      );

      console.log("Mandate Response:", mandateResponse);

      if (mandateResponse.status !== "Successful") {
        return NextResponse.json(
          {
            error: "Failed to create payment mandate",
            message: mandateResponse.message,
            details:
              mandateResponse.data?.errors || mandateResponse.data?.error,
          },
          { status: 400 },
        );
      }

      // Save mandate details
      await User.updateOne(
        { _id: userId },
        {
          hasMandateCreated: true,
          mandateRef: mandateResponse.data?.provider_response?.reference,
          mandateToken:
            mandateResponse.data?.provider_response?.provider_auth_token,
          mandateStatus: "active",
        },
      );

      // Update user object
      user.hasMandateCreated = true;
      user.mandateRef = mandateResponse.data?.provider_response?.reference;
      user.mandateToken =
        mandateResponse.data?.provider_response?.provider_auth_token;
    }

    // Step 2: Disburse loan to user's account
    console.log("Disbursing loan:", loanAmount);

    const disburseResponse = await disburse(
      user.accountNumber,
      user.bankCode,
      loanAmount * 100, // Convert to kobo
      {
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      "Loan Disbursement",
    );

    console.log("Disburse Response:", disburseResponse);

    if (disburseResponse.status !== "Successful") {
      return NextResponse.json(
        {
          error: "Failed to disburse loan",
          message: disburseResponse.message,
          details:
            disburseResponse.data?.errors || disburseResponse.data?.error,
        },
        { status: 400 },
      );
    }

    // Step 3: Calculate loan details
    const loanDetails = calculateLoanDetails(loanAmount, 5); // 5% fee

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1); // 1 month from today

    // Step 4: Create loan record
    const loan = await Loan.create({
      loanId: "LN" + Date.now(),
      userId: user._id,
      type: "loan",
      name: "Quick Loan",
      amount: loanDetails.amount,
      fee: loanDetails.fee,
      totalRepayment: loanDetails.totalRepayment,
      monthlyPayment: loanDetails.monthlyPayment,
      installments: 1,
      transactionRef: disburseResponse.data?.provider_response?.reference,
      purpose: purpose || "",
      status: "active",
      disbursedAt: new Date(),
      dueDate: dueDate,
    });

    // Step 5: Create payment schedule
    const paymentData = generateLoanPayment(loan, user._id.toString());
    await Payment.create(paymentData);

    // Step 6: Update user's available credit
    await User.updateOne(
      { _id: userId },
      { $inc: { availableCredit: -loanAmount } },
    );

    // Step 7: Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Loan approved and disbursed successfully",
        loan: {
          loanId: loan.loanId,
          amount: loan.amount,
          fee: loan.fee,
          totalRepayment: loan.totalRepayment,
          dueDate: dueDate.toISOString(),
          transactionRef: loan.transactionRef,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Loan application error:", error);
    return NextResponse.json(
      {
        error: "Loan application failed. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
