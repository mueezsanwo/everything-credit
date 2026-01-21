// app/api/shop/purchases/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import Payment from '@/models/Payment';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Get all purchases for user
    const purchases = await Purchase.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Get payments for each purchase
    const purchasesWithPayments = await Promise.all(
      purchases.map(async (purchase) => {
        const payments = await Payment.find({ purchaseId: purchase._id }).lean();
        
        return {
          ...purchase,
          payments: payments.map(p => ({
            id: p._id,
            paymentNumber: p.paymentNumber,
            dueDate: p.dueDate,
            amount: p.amount,
            status: p.status,
            paidDate: p.paidDate,
            transactionRef: p.transactionRef
          }))
        };
      })
    );
    
    return NextResponse.json({ 
      success: true,
      purchases: purchasesWithPayments
    });
    
  } catch (error: any) {
    console.error('Get purchases error:', error);
    return NextResponse.json({ 
      error: 'Failed to get purchases',
      details: error.message
    }, { status: 500 });
  }
}