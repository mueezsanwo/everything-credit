// app/api/shop/checkout/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import Purchase from '@/models/purchase';
import Payment from '@/models/payment';
import { createMandate } from '@/lib/onepipe/client';
import { calculatePurchaseDetails } from '@/lib/credit/calculations';
import { generatePaymentSchedule } from '@/lib/payments/scheduler';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { userId, cartItems, installmentPeriod, deliveryAddress } = body;
    
    // Validate required fields
    if (!userId || !cartItems || !installmentPeriod) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Validate installment period
    if (installmentPeriod < 1 || installmentPeriod > 6) {
      return NextResponse.json({ 
        error: 'Installment period must be between 1 and 6 months' 
      }, { status: 400 });
    }
    
    // Validate cart items
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ 
        error: 'Cart is empty' 
      }, { status: 400 });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Check if user has accessed credit
    if (!user.hasAccessedCredit) {
      return NextResponse.json({ 
        error: 'Please access your credit limit first' 
      }, { status: 400 });
    }
    
    // Calculate purchase totals
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    const purchaseDetails = calculatePurchaseDetails(subtotal, installmentPeriod, 3); // 3% fee
    
    // Validate against available credit (monthly payment check)
    if (purchaseDetails.monthlyPayment > user.availableCredit) {
      const suggestedMonths = Math.ceil(purchaseDetails.totalRepayment / user.availableCredit);
      return NextResponse.json({ 
        error: `Monthly payment (₦${purchaseDetails.monthlyPayment.toLocaleString()}) exceeds your available credit of ₦${user.availableCredit.toLocaleString()}`,
        suggestion: `Try selecting ${suggestedMonths} months (₦${Math.ceil(purchaseDetails.totalRepayment / suggestedMonths).toLocaleString()}/month)`
      }, { status: 400 });
    }
    
    // Validate against max purchasable (total amount check)
    const maxPurchasable = user.availableCredit * 6;
    if (purchaseDetails.totalRepayment > maxPurchasable) {
      return NextResponse.json({ 
        error: `Total amount (₦${purchaseDetails.totalRepayment.toLocaleString()}) exceeds your maximum purchasable limit of ₦${maxPurchasable.toLocaleString()}`,
        suggestion: 'Please remove some items from your cart'
      }, { status: 400 });
    }
    
    // Step 1: Create mandate if first time
    if (!user.hasMandateCreated) {
      console.log('Creating mandate for user:', user._id);
      
      const mandateResponse = await createMandate(
        user.accountNumber,
        user.bankCode,
        user.maxSingleDebit * 100, // Convert to kobo
        user.bvn.replace(/\*/g, ''), // Remove masking
        {
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        null
      );
      
      console.log('Mandate Response:', mandateResponse);
      
      if (mandateResponse.status !== 'Successful') {
        return NextResponse.json({ 
          error: 'Failed to create payment mandate',
          message: mandateResponse.message,
          details: mandateResponse.data?.errors || mandateResponse.data?.error
        }, { status: 400 });
      }
      
      // Save mandate details
      await User.updateOne(
        { _id: userId },
        {
          hasMandateCreated: true,
          mandateRef: mandateResponse.data?.provider_response?.reference,
          mandateToken: mandateResponse.data?.provider_response?.provider_auth_token,
          mandateStatus: 'active'
        }
      );
    }
    
    // Step 2: Create purchase record
    const purchase = await Purchase.create({
      purchaseId: 'PUR' + Date.now(),
      userId: user._id,
      type: 'purchase',
      items: cartItems.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || ''
      })),
      subtotal: purchaseDetails.subtotal,
      fee: purchaseDetails.fee,
      totalRepayment: purchaseDetails.totalRepayment,
      monthlyPayment: purchaseDetails.monthlyPayment,
      installments: installmentPeriod,
      deliveryStatus: 'pending_payment',
      deliveryAddress: deliveryAddress || user.address || '',
      status: 'active'
    });
    
    // Step 3: Generate payment schedule
    const paymentSchedule = generatePaymentSchedule(purchase, user._id.toString());
    await Payment.insertMany(paymentSchedule);
    
    // Step 4: Update user's available credit (deduct monthly payment)
    await User.updateOne(
      { _id: userId },
      { $inc: { availableCredit: -purchaseDetails.monthlyPayment } }
    );
    
    // Step 5: Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Purchase completed successfully',
      purchase: {
        purchaseId: purchase.purchaseId,
        items: purchase.items,
        subtotal: purchase.subtotal,
        fee: purchase.fee,
        totalRepayment: purchase.totalRepayment,
        monthlyPayment: purchase.monthlyPayment,
        installments: purchase.installments,
        deliveryStatus: purchase.deliveryStatus,
        firstPaymentDate: paymentSchedule[0].dueDate.toISOString()
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ 
      error: 'Checkout failed. Please try again.',
      details: error.message
    }, { status: 500 });
  }
}