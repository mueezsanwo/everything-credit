/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from "../../lib/mongodb";
import { NextResponse } from "next/server";
import { lookupBVN } from "@/lib/onepipe/client";
import { getUserFromRequest } from "../../lib/getUserFromRequest";
import User from "@/models/User";

export async function POST(request: Request) {
  await connectDB();

  // ✅ Get authenticated user ID
  const userId = await getUserFromRequest();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Fetch user
  const user = await User.findById(userId);
  console.log("User fetched for BVN check:", userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const { bvn } = body;

  if (!bvn) {
    return NextResponse.json(
      { error: "BVN is required" },
      { status: 400 }
    );
  }

  try {
    const customer = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
    };

    const bvnData = await lookupBVN(bvn, customer);

    user.bvn = body.bvn;
    user.bvnTransactionRef = bvnData.transactionRef; 

    await user.save();

    return NextResponse.json(
      { message: "BVN verified successfully", bvnData },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "BVN verification failed" },
      { status: 500 }
    );
  }
}