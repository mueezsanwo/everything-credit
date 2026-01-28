/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { getUserFromRequest } from '../../lib/getUserFromRequest';

export async function GET() {
  try {
    await connectDB();

    const userId = await getUserFromRequest();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: any) {
    console.error('Get profile error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get user profile',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
