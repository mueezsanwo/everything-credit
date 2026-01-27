/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import Otp from '@/models/OTP';
import { getBankCode } from '@/lib/utils/banks';
import { generateOTP, getOTPExpiration } from '@/lib/utils/otp';
import {
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  isValidAccountNumber,
  validatePassword,
} from '@/lib/utils/validation';
import connectDB from '../../lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '../../lib/email';
import { lookupAccount } from '@/lib/onepipe/client';
import { encryptBankAccount } from '@/lib/onepipe/encryption';

const APP_SECRET = process.env.ONEPIPE_APP_SECRET!;
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      address,
      dob,
      companyName,
      occupation,
      workEmail,
      monthlySalary,
      bankName,
      accountNumber,
      isSalaryAccount,
      agreedToTerms,
    } = body;

    /* ------------------ BASIC VALIDATIONS ------------------ */

    if (!firstName || !lastName || !phone || !email || !password || !dob) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be 11 digits' },
        { status: 400 },
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 },
      );
    }

    if (!isValidAccountNumber(accountNumber)) {
      return NextResponse.json(
        { error: 'Invalid account number. Must be 10 digits' },
        { status: 400 },
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

    /* ------------------ DUPLICATE USER CHECK ------------------ */

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: formattedPhone }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 },
      );
    }

    /* ------------------ BANK LOOKUP ------------------ */

    const bankCode = getBankCode(bankName);
    if (!bankCode) {
      return NextResponse.json({ error: 'Invalid bank name' }, { status: 400 });
    }

    const lookupResponse = await lookupAccount(accountNumber, bankCode, {
      firstName,
      lastName,
      email,
      phone: formattedPhone,
    });

    const providerData = lookupResponse?.data;

    const responseCode =
      providerData?.provider_response_code ||
      providerData?.provider_responde_code; // OnePipe typo fallback

    if (!providerData || responseCode !== '00') {
      const message =
        providerData?.error?.message ||
        providerData?.errors?.[0]?.message ||
        'Unable to verify bank account details';

      return NextResponse.json({ error: message }, { status: 400 });
    }

    const accountName = providerData.provider_response?.account_name;

    if (!accountName) {
      return NextResponse.json(
        { error: 'Unable to retrieve account name from bank' },
        { status: 400 },
      );
    }

    /* ------------------ NAME MATCHING ------------------ */

    const normalize = (name: string) =>
      name
        .toUpperCase()
        .replace(/[^A-Z\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const normalizedAccountName = normalize(accountName);
    const normalizedUserName = normalize(`${firstName} ${lastName}`);
    const tokenize = (name: string) =>
      name
        .split(' ')
        .filter(Boolean)
        .map((n) => n.trim());

    const accountTokens = tokenize(normalizedAccountName);
    const userTokens = tokenize(normalizedUserName);

    const isMatch = userTokens.every((token) =>
      accountTokens.some((acc) => acc.startsWith(token)),
    );

    if (!isMatch) {
      return NextResponse.json(
        {
          error:
            'Bank account name does not match the name you provided. Please use your own bank account.',
        },
        { status: 400 },
      );
    }

    /* ------------------ CREATE USER ------------------ */

    const hashedPassword = await bcrypt.hash(password, 10);

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
      monthlySalary: monthlySalary ? Number(monthlySalary) : null,
      bankName,
      bankCode,
      accountNumber,
      isSalaryAccount: Boolean(isSalaryAccount),
      status: 'pending_phone_verification',
      role: 'user',
      dob,
    });

    /* ------------------ OTP ------------------ */

    const otp = generateOTP(6);
    const expiresAt = getOTPExpiration();

    await Otp.create({
      phone: formattedPhone,
      email: email.toLowerCase(),
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

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully. Please verify your email.',
        userId: user._id,
        phone: formattedPhone,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Signup error:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Signup failed. Please try again.' },
      { status: 500 },
    );
  }
}

