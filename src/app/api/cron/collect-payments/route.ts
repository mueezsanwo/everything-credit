/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/payment';
import User from '@/models/user';
import { collect } from '@/lib/onepipe/client';

const CRON_SECRET = process.env.CRON_SECRET!;

const MAX_RETRIES = 3;
const GRACE_DAYS = 0; // allow collection within 2 days overdue

export async function GET(request: Request) {
  try {
    /* ---------- AUTH CHECK ---------- */
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    /* ---------- DATE WINDOW ---------- */
    const now = new Date();

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const graceDate = new Date();
    graceDate.setDate(graceDate.getDate() - GRACE_DAYS);

    /* ---------- FIND DUE PAYMENTS ---------- */
    const duePayments = await Payment.find({
      status: 'pending',
      retryCount: { $lt: MAX_RETRIES },
      dueDate: { $gte: graceDate, $lte: endOfToday },
    }).populate('userId');

    console.log(`Found ${duePayments.length} due payments`);

    const results = {
      total: duePayments.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as any[],
    };

    /* ---------- PROCESS PAYMENTS ---------- */
    for (const payment of duePayments) {
      try {
        const user = payment.userId as any;

        if (!user) {
          results.skipped++;
          continue;
        }

        /* ---------- VALIDATIONS ---------- */
        if (
          !user.hasMandateCreated ||
          !user.mandateToken ||
          user.mandateStatus !== 'active'
        ) {
          results.skipped++;
          continue;
        }

        /* ---------- LOCK PAYMENT ---------- */
        await Payment.updateOne(
          { _id: payment._id, status: 'pending' },
          { status: 'processing' },
        );

        console.log(`Collecting payment ${payment._id}`);

        /* ---------- CALL ONEPIPE ---------- */
        const collectResponse = await collect(
          user.accountNumber,
          user.bankCode,
          payment.amount * 100,
          {
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          `Installment ${payment.paymentNumber}`,
        );

        console.log('Collect response:', collectResponse);

        /* ---------- SAVE TRANSACTION REF ---------- */
        await Payment.updateOne(
          { _id: payment._id },
          {
            transactionRef:
              collectResponse.data?.provider_response?.reference ||
              'COL' + Date.now(),
          },
        );

        /* ---------- SUCCESS ---------- */
        if (collectResponse.status === 'Successful') {
          results.successful++;

          // Webhook should mark as PAID
          console.log(`Debit initiated: ${payment._id}`);
        } else {
          /* ---------- FAILURE ---------- */
          results.failed++;

          await Payment.updateOne(
            { _id: payment._id },
            {
              status: 'pending',
              $inc: { retryCount: 1 },
              lastRetryAt: new Date(),
              failureReason: collectResponse.message || 'Collection failed',
            },
          );

          results.errors.push({
            paymentId: payment._id,
            error: collectResponse.message,
          });
        }

        /* ---------- RATE LIMIT BUFFER ---------- */
        await new Promise((r) => setTimeout(r, 300));
      } catch (error: any) {
        console.error('Payment error:', error);

        results.failed++;

        await Payment.updateOne(
          { _id: payment._id },
          {
            status: 'pending',
            $inc: { retryCount: 1 },
            lastRetryAt: new Date(),
            failureReason: error.message,
          },
        );

        results.errors.push({
          paymentId: payment._id,
          error: error.message,
        });
      }
    }

    console.log('Collection Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Collection run completed',
      results,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Cron failure:', error);

    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
