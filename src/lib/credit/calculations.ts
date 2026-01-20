// lib/credit/calculations.ts

interface Transaction {
  transaction_type: string; // 'C' for credit, 'D' for debit
  transaction_amount: number;
  description: string;
  transaction_date: string;
}

interface SalaryVerificationResult {
  verified: boolean;
  verifiedSalary: number;
  reason: string;
}

/**
 * Verify salary from bank statement transactions
 * @param transactions - Statement list from OnePipe
 * @returns Salary verification result
 */
export function verifySalary(transactions: Transaction[]): SalaryVerificationResult {
  if (!transactions || transactions.length === 0) {
    return { 
      verified: false, 
      verifiedSalary: 0, 
      reason: 'No transactions found' 
    };
  }
  
  // Filter for potential salary transactions
  const salaryTransactions = transactions.filter(txn => {
    // Must be a credit
    if (txn.transaction_type !== 'C') return false;
    
    // Amount must be at least ₦100,000
    if (txn.transaction_amount < 100000) return false;
    
    // Description should contain salary keywords
    const desc = txn.description.toLowerCase();
    const salaryKeywords = ['salary', 'sal', 'payroll', 'monthly payment', 'income', 'wages'];
    const hasSalaryKeyword = salaryKeywords.some(keyword => desc.includes(keyword));
    
    return hasSalaryKeyword;
  });
  
  // Need at least 3 salary payments (3 months)
  if (salaryTransactions.length < 3) {
    return { 
      verified: false, 
      verifiedSalary: 0, 
      reason: `Only ${salaryTransactions.length} salary payment(s) found. Need at least 3 months of salary history.` 
    };
  }
  
  // Check for consistency (amounts should be similar)
  const amounts = salaryTransactions.map(t => t.transaction_amount);
  const avgSalary = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  const maxDeviation = avgSalary * 0.2; // Allow 20% deviation
  
  const isConsistent = amounts.every(amt => 
    Math.abs(amt - avgSalary) <= maxDeviation
  );
  
  if (!isConsistent) {
    return { 
      verified: false, 
      verifiedSalary: 0, 
      reason: 'Salary amounts are not consistent across months' 
    };
  }
  
  // Use the most recent or highest salary
  const verifiedSalary = Math.max(...amounts);
  
  return { 
    verified: true, 
    verifiedSalary, 
    reason: 'Salary verified successfully' 
  };
}

/**
 * Calculate credit limit
 * @param verifiedSalary - Verified monthly salary
 * @returns Credit limit (35% of salary, max ₦500K)
 */
export function calculateCreditLimit(verifiedSalary: number): number {
  const limit = verifiedSalary * 0.35;
  return Math.min(Math.floor(limit), 500000);
}

/**
 * Calculate available credit
 * @param creditLimit - User's credit limit
 * @param activeLoans - Active loans
 * @param activePurchases - Active purchases
 * @returns Available credit
 */
export function calculateAvailableCredit(
  creditLimit: number, 
  activeLoans: any[], 
  activePurchases: any[]
): number {
  const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalPurchaseMonthly = activePurchases.reduce((sum, purchase) => sum + purchase.monthlyPayment, 0);
  
  return Math.max(0, creditLimit - totalLoanAmount - totalPurchaseMonthly);
}

/**
 * Fuzzy name matching for BVN vs Account name
 * @param name1 - First name (e.g., "John Doe")
 * @param name2 - Second name (e.g., "DOE JOHN MIDDLE")
 * @returns True if names match
 */
export function verifyNameMatch(name1: string, name2: string): boolean {
  // Normalize: lowercase and remove special characters
  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  
  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  // Split into parts
  const parts1 = n1.split(/\s+/);
  const parts2 = n2.split(/\s+/);
  
  // Check if all parts of name1 exist in name2
  const allPartsMatch = parts1.every(part => 
    parts2.some(p => p.includes(part) || part.includes(p))
  );
  
  return allPartsMatch;
}

/**
 * Calculate loan details
 * @param amount - Loan amount
 * @param feePercentage - Fee percentage (default 5%)
 * @returns Loan calculation
 */
export function calculateLoanDetails(amount: number, feePercentage: number = 5) {
  const fee = amount * (feePercentage / 100);
  const totalRepayment = amount + fee;
  
  return {
    amount,
    fee,
    totalRepayment,
    monthlyPayment: totalRepayment // For 1-month loans
  };
}

/**
 * Calculate purchase details
 * @param subtotal - Subtotal of items
 * @param installments - Number of months (1-6)
 * @param feePercentage - Fee percentage (default 3%)
 * @returns Purchase calculation
 */
export function calculatePurchaseDetails(
  subtotal: number, 
  installments: number, 
  feePercentage: number = 3
) {
  const fee = subtotal * (feePercentage / 100);
  const totalRepayment = subtotal + fee;
  const monthlyPayment = totalRepayment / installments;
  
  return {
    subtotal,
    fee,
    totalRepayment,
    monthlyPayment: Math.ceil(monthlyPayment),
    installments
  };
}