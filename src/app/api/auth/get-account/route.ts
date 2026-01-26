/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/onepipe/lookup/route.ts
import { NextResponse } from "next/server";
import { lookupAccount } from "@/lib/onepipe/client"; // your lookupAccount function
import { encryptBankAccount } from "@/lib/onepipe/encryption";
import { getBankCode } from "@/lib/utils/banks";

interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountNumber, bankName, firstName, lastName, phone, email } = body;

    if (
      !accountNumber ||
      !firstName ||
      !lastName ||
      !phone ||
      !email || !bankName
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
        const bankCode = getBankCode(bankName);
        if (!bankCode) {
          return NextResponse.json({ error: "Invalid bank name" }, { status: 400 });
        }

    const customer: Customer = {
      firstName,
      lastName,
      phone,
      email,
    };

    // Call your lookup function
    const response = await lookupAccount(accountNumber, bankCode, customer);

    console.log("ONEPIPE LOOKUP RESPONSE:", JSON.stringify(response, null, 2));

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    console.error("Lookup error:", err);
    return NextResponse.json(
      { error: err.message || "Lookup failed" },
      { status: 500 }
    );
  }
}
