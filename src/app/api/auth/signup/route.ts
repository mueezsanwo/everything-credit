// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import OTP from "@/models/otp";
import { getBankCode } from "@/lib/utils/banks";
import { generateOTP, getOTPExpiration } from "@/lib/utils/otp";
import {
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  isValidAccountNumber,
  validatePassword,
} from "@/lib/utils/validation";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      address,
      companyName,
      occupation,
      workEmail,
      monthlySalary,
      bankName,
      accountNumber,
      isSalaryAccount,
      agreedToTerms,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone || !email || !password) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      return NextResponse.json(
        {
          error: "You must agree to the terms and conditions",
        },
        { status: 400 },
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: "Invalid email format",
        },
        { status: 400 },
      );
    }

    // Validate phone
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        {
          error: "Invalid phone number. Must be 11 digits (e.g., 08012345678)",
        },
        { status: 400 },
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: passwordValidation.message,
        },
        { status: 400 },
      );
    }

    // Validate account number
    if (accountNumber && !isValidAccountNumber(accountNumber)) {
      return NextResponse.json(
        {
          error: "Invalid account number. Must be 10 digits",
        },
        { status: 400 },
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: formattedPhone }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User with this email or phone already exists",
        },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get bank code from bank name
    const bankCode = getBankCode(bankName);

    if (!bankCode) {
      return NextResponse.json(
        {
          error: "Invalid bank name",
        },
        { status: 400 },
      );
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      phone: formattedPhone,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
      companyName,
      occupation,
      workEmail,
      monthlySalary: monthlySalary ? parseInt(monthlySalary) : null,
      bankName,
      bankCode,
      accountNumber,
      status: "pending_phone_verification",
      role: "user",
    });

    // Generate OTP
    const otp = generateOTP(6);
    const expiresAt = getOTPExpiration();

    // Save OTP to database
    await OTP.create({
      phone: formattedPhone,
      email: email.toLowerCase(),
      otp,
      type: "phone",
      verified: false,
      expiresAt,
    });

    // TODO: Send OTP via SMS provider (Termii, Twilio, etc.)
    console.log(`OTP for ${formattedPhone}: ${otp}`);
    // await sendSMS(formattedPhone, `Your Everything Credit OTP is: ${otp}`);

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully. Please verify your phone number.",
        userId: user._id,
        phone: formattedPhone,
        // For demo purposes only - remove in production
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Signup error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "User with this email or phone already exists",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Signup failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
