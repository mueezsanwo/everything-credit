// app/loans/page.tsx - Loan Application
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Wallet, Zap, ArrowLeft, CheckCircle, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function Loans() {
  const router = useRouter();
  const [step, setStep] = useState<'select' | 'apply' | 'processing' | 'success'>('select');
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock user data (in real app, fetch from session/API)
  const user = {
    name: 'John Doe',
    hasAccessedCredit: true, // Assume user has accessed credit
    creditLimit: 52500,
    availableCredit: 42500, // Example: Already used 10,000
    activeLoanAmount: 10000, // Current outstanding loan
    hasMandateCreated: false // First time using credit
  };

  const loanProduct = {
    name: 'Quick Loan',
    description: 'Get instant cash for your needs',
    minAmount: 5000,
    maxAmount: 500000,
    tenure: 1,
    tenureText: '1 month',
    fee: 5,
    feeText: '5%'
  };

  const [loanData, setLoanData] = useState({
    loanId: '',
    loanName: '',
    amount: 0,
    fee: 0,
    totalRepayment: 0,
    dueDate: '',
    transactionRef: ''
  });

  const handleSelectLoan = () => {
    if (!user.hasAccessedCredit) {
      router.push('/access-credit');
      return;
    }
    setStep('apply');
  };

  const handleSubmitLoan = async () => {
    const amount = parseInt(loanAmount);
    
    if (!amount || amount < loanProduct.minAmount || amount > loanProduct.maxAmount) {
      return;
    }

    if (amount > user.availableCredit) {
      alert(`Amount exceeds your available credit of ₦${user.availableCredit.toLocaleString()}`);
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      // Step 1: Create mandate if first time (mock)
      if (!user.hasMandateCreated) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Real: POST /api/mandate/create
      }

      // Step 2: Disburse loan to user's account (mock)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Real API call would be:
      // POST /api/loans/disburse
      // Body: { amount, userId, accountNumber, bankCode }
      // Backend calls OnePipe Disburse API
      
      const mockDisburseResponse = {
        status: 'Successful',
        data: {
          provider_response: {
            reference: 'LN' + Date.now(),
            payment_id: '136FTTP' + Date.now(),
            beneficiary_account_name: 'JOHN DOE',
            transaction_final_amount: amount * 100, // in kobo
          }
        }
      };

      // Calculate loan details
      const feeAmount = amount * (loanProduct.fee / 100);
      const totalRepayment = amount + feeAmount;
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);

      setLoanData({
        loanId: 'loan-' + Date.now(),
        loanName: loanProduct.name,
        amount: amount,
        fee: feeAmount,
        totalRepayment: totalRepayment,
        dueDate: dueDate.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }),
        transactionRef: mockDisburseResponse.data.provider_response.reference
      });

      // Step 3: Save loan to database (mock)
      // Real: POST /api/loans/create
      // Body: { userId, amount, fee, totalRepayment, dueDate, transactionRef, status: 'active' }

      setStep('success');
    } catch (error) {
      console.error('Loan application error:', error);
      alert('Failed to process loan. Please try again.');
      setStep('apply');
    } finally {
      setLoading(false);
    }
  };

  // Loan Selection Screen
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Everything Credit</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for a Loan</h1>
            <p className="text-gray-600">Choose a loan product that suits your needs</p>
          </div>

          {/* Credit Status */}
          {user.hasAccessedCredit ? (
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Credit Limit</p>
                <p className="text-2xl font-bold text-gray-900">₦{user.creditLimit.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Available Credit</p>
                <p className="text-2xl font-bold text-green-600">₦{user.availableCredit.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">₦{user.activeLoanAmount.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
              <h3 className="text-xl font-bold mb-2">Access Credit First</h3>
              <p className="text-blue-100 mb-4">You need to access your credit limit before applying for loans</p>
              <Link 
                href="/access-credit"
                className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Access Credit Now
              </Link>
            </div>
          )}

          {/* Single Loan Product */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                    {loanProduct.feeText} fee
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-3">{loanProduct.name}</h3>
                <p className="text-white/90 text-lg">{loanProduct.description}</p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Loan Range</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₦{(loanProduct.minAmount / 1000).toFixed(0)}K - ₦{(loanProduct.maxAmount / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Repayment Period</p>
                    <p className="text-xl font-semibold text-gray-900">{loanProduct.tenureText}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleSelectLoan}
                  disabled={!user.hasAccessedCredit}
                  className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {user.hasAccessedCredit ? 'Apply for Loan' : 'Access Credit First'}
                </button>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">How Loan Repayment Works</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>Your loan will be disbursed instantly to your registered account</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>Repayment will be automatically deducted from your salary account in 1 month</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>A 5% service fee is added to your loan amount</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>Early repayment is allowed without penalties</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Loan Application Form
  if (step === 'apply') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <button 
              onClick={() => setStep('select')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Loan Products</span>
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{loanProduct.name} Application</h2>
              <p className="text-gray-600">{loanProduct.description}</p>
            </div>

            <div className="space-y-6">
              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount (₦)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                  placeholder={`Enter amount (₦${loanProduct.minAmount.toLocaleString()} - ₦${loanProduct.maxAmount.toLocaleString()})`}
                  min={loanProduct.minAmount}
                  max={Math.min(loanProduct.maxAmount, user.availableCredit)}
                />
                <div className="flex items-center justify-between mt-2 text-sm">
                  <p className="text-gray-500">
                    Min: ₦{loanProduct.minAmount.toLocaleString()} | Max: ₦{Math.min(loanProduct.maxAmount, user.availableCredit).toLocaleString()}
                  </p>
                  <p className="text-gray-500">
                    Available: ₦{user.availableCredit.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Loan Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose (Optional)</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                  placeholder="What will you use this loan for?"
                  rows={3}
                />
              </div>

              {/* Loan Summary */}
              {loanAmount && parseInt(loanAmount) >= loanProduct.minAmount && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Loan Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loan Amount:</span>
                      <span className="font-semibold text-gray-900">₦{parseInt(loanAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee ({loanProduct.fee}%):</span>
                      <span className="font-semibold text-gray-900">₦{(parseInt(loanAmount) * loanProduct.fee / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <span className="font-bold text-gray-900">Total Repayment:</span>
                      <span className="font-bold text-blue-600 text-lg">
                        ₦{(parseInt(loanAmount) * (1 + loanProduct.fee / 100)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Repayment Date:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning for first-time users */}
              {!user.hasMandateCreated && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 mb-1">First Time Credit Usage</p>
                      <p className="text-gray-700">
                        A direct debit mandate will be created on your account to enable automatic repayment. This is a one-time setup.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitLoan}
                disabled={!loanAmount || parseInt(loanAmount) < loanProduct.minAmount || parseInt(loanAmount) > Math.min(loanProduct.maxAmount, user.availableCredit) || loading}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Submit Loan Application'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Processing Screen
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin">
              <Wallet className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Loan</h2>
          <p className="text-gray-600 mb-6">Please wait while we process your application...</p>
          <div className="space-y-3 text-left">
            {!user.hasMandateCreated && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Creating direct debit mandate...</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Verifying loan details...</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-gray-400">Disbursing funds...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success Screen
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Approved! 🎉</h1>
            <p className="text-gray-600">Your loan has been successfully processed</p>
          </div>

          {/* Loan Details */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center mb-6">
            <p className="text-blue-100 mb-2">Loan Amount</p>
            <p className="text-4xl font-bold mb-1">₦{loanData.amount.toLocaleString()}</p>
            <p className="text-sm text-blue-100">Disbursed to your account</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Loan Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction Reference:</span>
                <span className="font-semibold text-gray-900">{loanData.transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Amount:</span>
                <span className="font-semibold text-gray-900">₦{loanData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee:</span>
                <span className="font-semibold text-gray-900">₦{loanData.fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-bold text-gray-900">Total Repayment:</span>
                <span className="font-bold text-blue-600">₦{loanData.totalRepayment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-semibold text-gray-900">{loanData.dueDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h4 className="font-bold text-gray-900 mb-2">What's Next?</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Funds will be credited to your account within 5 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Repayment will be auto-debited on {loanData.dueDate}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>You'll receive SMS and email confirmation shortly</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setStep('select');
                setLoanAmount('');
                setPurpose('');
              }}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Apply for Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}