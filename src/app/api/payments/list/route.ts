// app/api/payments/list/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import Loan from '@/models/loan';
import Purchase from '@/models/purchase';
import Payment from '@/models/payment';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Get all loans with their payments
    const loans = await Loan.find({ 
      userId, 
      status: { $in: ['active', 'completed'] } 
    }).lean();
    
    // Get all purchases with their payments
    const purchases = await Purchase.find({ 
      userId, 
      status: { $in: ['active', 'completed'] } 
    }).lean();
    
    // Get all payments
    const allPayments = await Payment.find({ userId }).lean();
    
    // Format loans with their payments
    const loansWithPayments = loans.map(loan => {
      const loanPayments = allPayments.filter(p => 
        p.loanId && p.loanId.toString() === loan._id.toString()
      );
      
      return {
        id: loan.loanId,
        type: 'loan',
        name: loan.name,
        amount: loan.amount,
        fee: loan.fee,
        totalRepayment: loan.totalRepayment,
        monthlyPayment: loan.monthlyPayment,
        installments: loan.installments,
        status: loan.status,
        date: loan.createdAt,
        dueDate: loan.dueDate,
        transactionRef: loan.transactionRef,
        deliveryStatus: null,
        payments: loanPayments.map(p => ({
          id: p._id,
          paymentNumber: p.paymentNumber,
          dueDate: p.dueDate,
          amount: p.amount,
          status: p.status,
          paidDate: p.paidDate,
          transactionRef: p.transactionRef
        }))
      };
    });
    
    // Format purchases with their payments
    const purchasesWithPayments = purchases.map(purchase => {
      const purchasePayments = allPayments.filter(p => 
        p.purchaseId && p.purchaseId.toString() === purchase._id.toString()
      );
      
      return {
        id: purchase.purchaseId,
        type: 'purchase',
        name: purchase.items.map(i => i.name).join(', '),
        items: purchase.items,
        amount: purchase.subtotal,
        fee: purchase.fee,
        totalRepayment: purchase.totalRepayment,
        monthlyPayment: purchase.monthlyPayment,
        installments: purchase.installments,
        status: purchase.status,
        date: purchase.createdAt,
        deliveryStatus: purchase.deliveryStatus,
        deliveredAt: purchase.deliveredAt,
        payments: purchasePayments.map(p => ({
          id: p._id,
          paymentNumber: p.paymentNumber,
          dueDate: p.dueDate,
          amount: p.amount,
          status: p.status,
          paidDate: p.paidDate,
          transactionRef: p.transactionRef
        }))
      };
    });
    
    // Combine all items
    const allItems = [...loansWithPayments, ...purchasesWithPayments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate summary stats
    const totalPaid = allPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalOutstanding = allPayments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const upcomingPayments = allPayments
      .filter(p => p.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5) // Next 5 payments
      .map(p => {
        // Find parent loan or purchase
        const parentLoan = loans.find(l => l._id.toString() === p.loanId?.toString());
        const parentPurchase = purchases.find(pur => pur._id.toString() === p.purchaseId?.toString());
        
        return {
          id: p._id,
          paymentNumber: p.paymentNumber,
          dueDate: p.dueDate,
          amount: p.amount,
          status: p.status,
          itemName: parentLoan ? parentLoan.name : (parentPurchase ? parentPurchase.items.map(i => i.name).join(', ') : 'Unknown')
        };
      });
    
    return NextResponse.json({ 
      success: true,
      summary: {
        creditLimit: user.creditLimit,
        availableCredit: user.availableCredit,
        totalOutstanding: totalOutstanding,
        totalPaid: totalPaid,
        activeItems: allItems.filter(i => i.status === 'active').length
      },
      items: allItems,
      upcomingPayments: upcomingPayments
    });
    
  } catch (error: any) {
    console.error('Get payments error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch payments',
      details: error.message
    }, { status: 500 });
  }
}