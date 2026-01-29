/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/payments/scheduler.ts

/**
 * Generate payment schedule for a purchase
 * @param purchase - Purchase object with installments and monthlyPayment
 * @param userId - User ID
 * @returns Array of payment objects ready for DB insertion
 */
// export function generatePaymentSchedule(purchase: any, userId: string) {
//   const payments = [];
  
//   for (let i = 1; i <= purchase.installments; i++) {
//     const dueDate = new Date();
//     dueDate.setMonth(dueDate.getMonth() + i);
    
//     payments.push({
//       purchaseId: purchase._id,
//       userId: userId,
//       paymentNumber: i,
//       dueDate,
//       amount: purchase.monthlyPayment,
//       status: 'pending'
//     });
//   }
  
//   return payments;
// }

export function generatePaymentSchedule(purchase: any, userId: string) {
  const payments = [];
  const baseDate = new Date();

  for (let i = 1; i <= purchase.installments; i++) {
    const dueDate = new Date(baseDate);

    // Add i days instead of months
    dueDate.setDate(dueDate.getDate() + i);
    dueDate.setHours(9, 0, 0, 0); // 9AM debit time

    payments.push({
      purchaseId: purchase._id,
      userId,
      paymentNumber: i,
      dueDate,
      amount: purchase.monthlyPayment, // rename to dailyPayment ideally
      status: 'pending',
      retryCount: 0,
    });
  }

  return payments;
}

/**
 * Generate single payment for a loan
 * @param loan - Loan object
 * @param userId - User ID
 * @returns Payment object ready for DB insertion
 */
export function generateLoanPayment(loan: any, userId: string) {
  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 1); // 1 month from now
  
  return {
    loanId: loan._id,
    userId: userId,
    paymentNumber: 1,
    dueDate,
    amount: loan.totalRepayment,
    status: 'pending'
  };
}

/**
 * Check if delivery should be triggered (50% paid)
 * @param payments - All payments for a purchase
 * @returns True if should deliver
 */
export function shouldTriggerDelivery(payments: any[]): boolean {
  const totalPayments = payments.length;
  const paidPayments = payments.filter(p => p.status === 'paid').length;
  const percentPaid = (paidPayments / totalPayments) * 100;
  
  return percentPaid >= 50;
}

/**
 * Check if all payments are completed
 * @param payments - All payments for a loan/purchase
 * @returns True if all paid
 */
export function areAllPaymentsCompleted(payments: any[]): boolean {
  return payments.every(p => p.status === 'paid');
}

/**
 * Get delivery status based on payment progress
 * @param payments - All payments for a purchase
 * @returns Delivery status
 */
export function getDeliveryStatus(payments: any[]): 'pending_payment' | 'in_transit' | 'delivered' {
  const totalPayments = payments.length;
  const paidPayments = payments.filter(p => p.status === 'paid').length;
  const percentPaid = (paidPayments / totalPayments) * 100;
  
  if (percentPaid >= 100) {
    return 'delivered';
  } else if (percentPaid >= 50) {
    return 'in_transit';
  } else {
    return 'pending_payment';
  }
}

/**
 * Get next due payment for a user
 * @param payments - All user's pending payments
 * @returns Next payment or null
 */
export function getNextDuePayment(payments: any[]) {
  const pendingPayments = payments
    .filter(p => p.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  return pendingPayments.length > 0 ? pendingPayments[0] : null;
}

/**
 * Get overdue payments
 * @param payments - All payments
 * @returns Overdue payments
 */
export function getOverduePayments(payments: any[]) {
  const now = new Date();
  
  return payments.filter(p => 
    p.status === 'pending' && new Date(p.dueDate) < now
  );
}

/**
 * Add months to a date
 * @param date - Starting date
 * @param months - Number of months to add
 * @returns New date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Check if a payment is due today
 * @param dueDate - Payment due date
 * @returns True if due today
 */
export function isDueToday(dueDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due.getTime() === today.getTime();
}

/**
 * Check if a payment is overdue
 * @param dueDate - Payment due date
 * @returns True if overdue
 */
export function isOverdue(dueDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
}