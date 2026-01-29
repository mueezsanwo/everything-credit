/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 },
      );
    }

    // Compare with ENV
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Generate JWT
    // const token = jwt.sign(
    //   {
    //     role: 'admin',
    //     email,
    //   },
    //   process.env.ADMIN_JWT_SECRET!,
    //   { expiresIn: '1d' },
    // );

    const token = jwt.sign({ role: 'admin', email }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Admin login successful',
      token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 },
    );
  }
}
