/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Otp from "@/models/OTP";
import { getBankCode } from "@/lib/utils/banks";
import { generateOTP, getOTPExpiration } from "@/lib/utils/otp";
import {
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  isValidAccountNumber,
  validatePassword,
} from "@/lib/utils/validation";
import connectDB from "../../lib/mongodb";
import User from "@/models/User";
import { sendEmail } from "../../lib/email";
import { lookupAccount } from "@/lib/onepipe/client";
import { encryptBankAccount } from "@/lib/onepipe/encryption";

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
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

    if (!firstName || !lastName || !phone || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        { error: "You must agree to the terms and conditions" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number. Must be 11 digits" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    if (!isValidAccountNumber(accountNumber)) {
      return NextResponse.json(
        { error: "Invalid account number. Must be 10 digits" },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

    /* ------------------ DUPLICATE USER CHECK ------------------ */

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: formattedPhone }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 }
      );
    }

    /* ------------------ BANK LOOKUP ------------------ */

    const bankCode = getBankCode(bankName);
    if (!bankCode) {
      return NextResponse.json({ error: "Invalid bank name" }, { status: 400 });
    }

    const securePayload = encryptBankAccount(
      accountNumber,
      bankCode,
      APP_SECRET
    );
    console.log("Account Number:", accountNumber);
    console.log("Bank Code:", bankCode);
    
    console.log("Encrypted secure payload for OnePipe:", securePayload);

    const lookupResponse = await lookupAccount(accountNumber, bankCode, {
      firstName,
      lastName,
      email,
      phone: formattedPhone,
    });

    console.log(
      "ONEPIPE LOOKUP RESPONSE:",
      JSON.stringify(lookupResponse, null, 2)
    );

    const providerData = lookupResponse?.data;

    const responseCode =
      providerData?.provider_response_code ||
      providerData?.provider_responde_code; // OnePipe typo fallback

    if (!providerData || responseCode !== "00") {
      const message =
        providerData?.error?.message ||
        providerData?.errors?.[0]?.message ||
        "Unable to verify bank account details";

      return NextResponse.json({ error: message }, { status: 400 });
    }

    const accountName = providerData.provider_response?.account_name;

    if (!accountName) {
      return NextResponse.json(
        { error: "Unable to retrieve account name from bank" },
        { status: 400 }
      );
    }

    /* ------------------ NAME MATCHING ------------------ */

    const normalize = (name: string) =>
      name
        .toUpperCase()
        .replace(/[^A-Z\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const normalizedAccountName = normalize(accountName);
    const normalizedUserName = normalize(`${firstName} ${lastName}`);

    if (!normalizedAccountName.includes(normalizedUserName)) {
      return NextResponse.json(
        {
          error:
            "Bank account name does not match the name you provided. Please use your own bank account.",
        },
        { status: 400 }
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
      status: "pending_phone_verification",
      role: "user",
    });

    /* ------------------ OTP ------------------ */

    const otp = generateOTP(6);
    const expiresAt = getOTPExpiration();

    await Otp.create({
      phone: formattedPhone,
      email: email.toLowerCase(),
      otp,
      type: "email",
      verified: false,
      expiresAt,
    });

    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
      text: `Your OTP for email verification is: ${otp}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully. Please verify your email.",
        userId: user._id,
        phone: formattedPhone,
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Signup failed. Please try again." },
      { status: 500 }
    );
  }
}


// // app/api/auth/signup/route.ts
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import User from "@/models/User";
// import Otp from "@/models/OTP";
// import connectDB from "@/lib/mongodb";
// import { getBankCode } from "@/lib/utils/banks";
// import { encryptBankAccount } from "@/lib/onepipe/encryption";
// import { generateOTP, getOTPExpiration } from "@/lib/utils/otp";
// import {
//   isValidEmail,
//   isValidPhone,
//   formatPhoneNumber,
//   isValidAccountNumber,
//   validatePassword,
// } from "@/lib/utils/validation";
// import fetch from "node-fetch"; // or global fetch in Node 20+
// import { sendEmail } from "../../lib/email";
// import { lookupAccount } from "@/lib/onepipe/client";

// interface Customer {
//   phone: string;
//   firstName: string;
//   lastName: string;
//   email: string;
// }

// interface OnePipeResponse {
//   status: string;
//   message?: string | null;
//   data?: {
//     provider_response_code?: string;
//     provider_responde_code?: string; // typo fallback
//     provider_response?: {
//       account_name: string;
//       account_number: string;
//       bank_name?: string;
//     };
//     errors?: Array<{ code: string; message: string }>;
//     error?: { code: string; message: string };
//   };
// }

// // async function lookupAccount(accountNumber: string, bankCode: string, customer: Customer) {
// //   const requestRef = "REQ" + Date.now();
// //   const transactionRef = "TXN" + Date.now();
// //   const secure = encryptBankAccount(accountNumber, bankCode, process.env.ONEPIPE_APP_SECRET!);

// //   const payload = {
// //     request_ref: requestRef,
// //     request_type: "lookup_account_min",
// //     auth: {
// //       type: "bank.account",
// //       secure,
// //       auth_provider: "PaywithAccount",
// //       route_mode: null,
// //     },
// //     transaction: {
// //       mock_mode: "Live",
// //       transaction_ref: transactionRef,
// //       transaction_desc: "Account Lookup",
// //       transaction_ref_parent: null,
// //       amount: 0,
// //       customer: {
// //         customer_ref: customer.phone,
// //         firstname: customer.firstName,
// //         surname: customer.lastName,
// //         email: customer.email,
// //         mobile_no: customer.phone,
// //       },
// //       meta: {},
// //       details: {},
// //     },
// //   };

// //   const res = await fetch("https://api.onepipe.io/bank/lookup", {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //       Authorization: `Bearer ${process.env.ONEPIPE_API_KEY}`,
// //     },
// //     body: JSON.stringify(payload),
// //   });

// //   return (await res.json()) as OnePipeResponse;
// // }

// export async function POST(request: Request) {
//   try {
//     await connectDB();

//     const body = await request.json();
//     const {
//       firstName,
//       lastName,
//       phone,
//       email,
//       password,
//       address,
//       companyName,
//       occupation,
//       workEmail,
//       monthlySalary,
//       bankName,
//       accountNumber,
//       isSalaryAccount,
//       agreedToTerms,
//     } = body;

//     /* ------------------ BASIC VALIDATIONS ------------------ */
//     if (!firstName || !lastName || !phone || !email || !password) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }
//     if (!agreedToTerms) {
//       return NextResponse.json({ error: "You must agree to the terms and conditions" }, { status: 400 });
//     }
//     if (!isValidEmail(email)) {
//       return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
//     }
//     if (!isValidPhone(phone)) {
//       return NextResponse.json({ error: "Invalid phone number. Must be 11 digits" }, { status: 400 });
//     }
//     const passwordValidation = validatePassword(password);
//     if (!passwordValidation.isValid) {
//       return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
//     }
//     if (!isValidAccountNumber(accountNumber)) {
//       return NextResponse.json({ error: "Invalid account number. Must be 10 digits" }, { status: 400 });
//     }

//     const formattedPhone = formatPhoneNumber(phone);

//     /* ------------------ DUPLICATE USER CHECK ------------------ */
//     const existingUser = await User.findOne({
//       $or: [{ email: email.toLowerCase() }, { phone: formattedPhone }],
//     });
//     if (existingUser) {
//       return NextResponse.json({ error: "User with this email or phone already exists" }, { status: 400 });
//     }

//     /* ------------------ BANK LOOKUP ------------------ */
//     const bankCode = getBankCode(bankName);
//     if (!bankCode) return NextResponse.json({ error: "Invalid bank name" }, { status: 400 });

//     const lookupResult =  lookupAccount(accountNumber, bankCode, {
//       firstName,
//       lastName,
//       email,
//       phone: formattedPhone,
//     });
//     console.log("ONEPIPE LOOKUP RESPONSE:", JSON.stringify(lookupResult, null, 2));

//     const providerData = (await lookupResult).data;
//     const responseCode = providerData?.provider_response_code || providerData?.provider_responde_code;

//     if (!providerData || responseCode !== "00") {
//       const message =
//         providerData?.error?.message ||
//         providerData?.errors?.[0]?.message ||
//         "Unable to verify bank account details";
//       return NextResponse.json({ error: message }, { status: 400 });
//     }

//     const accountName = providerData.provider_response!.account_name;

//     /* ------------------ NAME MATCHING ------------------ */
//     const normalize = (name: string) =>
//       name.toUpperCase().replace(/[^A-Z\s]/g, "").replace(/\s+/g, " ").trim();
//     const normalizedAccountName = normalize(accountName);
//     const normalizedUserName = normalize(`${firstName} ${lastName}`);
//     if (!normalizedAccountName.includes(normalizedUserName)) {
//       return NextResponse.json(
//         { error: "Bank account name does not match the name you provided. Please use your own bank account." },
//         { status: 400 }
//       );
//     }

//     /* ------------------ CREATE USER ------------------ */
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       firstName,
//       lastName,
//       phone: formattedPhone,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       address,
//       companyName,
//       occupation,
//       workEmail,
//       monthlySalary: monthlySalary ? Number(monthlySalary) : null,
//       bankName,
//       bankCode,
//       accountNumber,
//       isSalaryAccount: Boolean(isSalaryAccount),
//       status: "pending_phone_verification",
//       role: "user",
//     });

//     /* ------------------ OTP ------------------ */
//     const otp = generateOTP(6);
//     const expiresAt = getOTPExpiration();
//     await Otp.create({
//       phone: formattedPhone,
//       email: email.toLowerCase(),
//       otp,
//       type: "email",
//       verified: false,
//       expiresAt,
//     });

//     await sendEmail({
//       to: email,
//       subject: "Verify Your Email",
//       html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
//       text: `Your OTP for email verification is: ${otp}`,
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "User created successfully. Please verify your email.",
//         userId: user._id,
//         phone: formattedPhone,
//         otp: process.env.NODE_ENV === "development" ? otp : undefined,
//       },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error("Signup error:", error);

//     if (error.code === 11000) {
//       return NextResponse.json({ error: "User with this email or phone already exists" }, { status: 400 });
//     }

//     return NextResponse.json({ error: "Signup failed. Please try again." }, { status: 500 });
//   }
// }
