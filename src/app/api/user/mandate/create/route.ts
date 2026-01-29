/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import connectDB from '@/app/api/lib/mongodb';
import { getUserFromRequest } from '@/app/api/lib/getUserFromRequest';
import User from '@/models/User';
import { createMandate } from '@/lib/onepipe/client';

export async function POST() {
  await connectDB();

  const userId = await getUserFromRequest();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.bvnVerified || !user.bvn) {
    return NextResponse.json(
      { error: 'BVN must be verified first' },
      { status: 400 },
    );
  }

  if (!user.accountNumber || !user.bankCode) {
    return NextResponse.json(
      { error: 'Bank details missing' },
      { status: 400 },
    );
  }

  if (user.mandateStatus === 'ACTIVE') {
    return NextResponse.json(
      { error: 'Active mandate already exists' },
      { status: 400 },
    );
  }

  try {
    const customer = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    };

    const response = await createMandate(
      user.accountNumber,
      user.bankCode,
      user.creditLimit * 100, // kobo
      user.bvn,
      customer,
    );

    console.log('Mandate creation response:', response);
    if (response.status !== 'Successful') {
      throw new Error(response.message || 'Mandate creation failed');
    }

    const providerResponse = response.data?.provider_response;
    if (!providerResponse?.reference) {
      throw new Error('Mandate reference missing');
    }

    // ✅ Persist mandate
    user.mandateRef = providerResponse.reference;
    user.mandateStatus = providerResponse.status; // ACTIVE
    user.mandateSubscription_id = providerResponse.meta.subscription_id;
    user.mandateActivatedAt = new Date();
    user.hasMandateCreated = true;
    user.hasAccessedCredit = true;

    await user.save();

    return NextResponse.json(
      {
        message: 'Mandate created successfully',
        mandateRef: providerResponse.reference,
        mandateStatus: providerResponse.status,
        activationurl: providerResponse.meta.activation_url,
        providerResponse,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Mandate creation error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to create mandate' },
      { status: 500 },
    );
  }
}
