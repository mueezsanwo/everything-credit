// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { isValidEmail } from "@/lib/utils/validation";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        { status: 400 },
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: "Invalid email format",
        },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Update last login
    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    // Return user data (exclude password)
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        phoneVerified: user.phoneVerified,
        bvnVerified: user.bvnVerified,
        hasAccessedCredit: user.hasAccessedCredit,
        creditLimit: user.creditLimit,
        availableCredit: user.availableCredit,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Login failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
