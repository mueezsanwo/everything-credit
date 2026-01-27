import { NextResponse } from 'next/server';
import User from '@/models/User';
import { getUserFromRequest } from '../../lib/getUserFromRequest';
import connectDB from '../../lib/mongodb';

export async function POST(request: Request) {
  await connectDB();

  // ✅ Get authenticated user ID
  const userId = await getUserFromRequest();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ Fetch user
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // ✅ Monthly salary must already exist on user
  const monthlySalary = user.monthlySalary;

  if (!monthlySalary || monthlySalary <= 0) {
    return NextResponse.json(
      { error: 'Monthly salary not set for user' },
      { status: 400 },
    );
  }

  // ✅ Credit calculation (25% capped at ₦100,000)
  const calculatedCredit = Math.min(monthlySalary * 0.25, 100_000);

  user.creditLimit = calculatedCredit;
  user.availableCredit = calculatedCredit;
  user.maxSingleDebit = calculatedCredit;
  user.verifiedSalary = monthlySalary;

  await user.save();

  return NextResponse.json({
    message: 'Credit calculated successfully',
    creditLimit: calculatedCredit,
    availableCredit: calculatedCredit,
  });
}
