// app/access-credit/page.tsx - Access Credit Flow (Compact for Large Screens)
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Shield, CheckCircle, AlertCircle, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Step = 'consent' | 'verifying' | 'approved' | 'rejected';

export default function AccessCredit() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('consent');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [creditData, setCreditData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    verifiedSalary: 0,
    creditLimit: 0,
    maxSingleDebit: 0
  });

  const handleConsent = async () => {
    if (!agreed) return;

    setLoading(true);
    setStep('verifying');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const accountLookup = {
        status: 'Successful',
        data: {
          provider_response: {
            account_number: '0123456789',
            account_name: 'JOHN DOE',
            bank_name: 'Access Bank',
            bvn: '22123456789',
            account_status: 'ACCOUNT OPEN',
            kyc_level: '3'
          }
        }
      };

      await new Promise(resolve => setTimeout(resolve, 2000));

      const statementResponse = {
        status: 'Successful',
        data: {
          provider_response: {
            opening_balance: 50000,
            closing_balance: 180000,
            statement_list: [
              { transaction_amount: 150000, transaction_type: 'C', transaction_date: '2024-10-25T00:00:00', description: 'SALARY PAYMENT OCT 2024' },
              { transaction_amount: 150000, transaction_type: 'C', transaction_date: '2024-11-25T00:00:00', description: 'SALARY PAYMENT NOV 2024' },
              { transaction_amount: 150000, transaction_type: 'C', transaction_date: '2024-12-25T00:00:00', description: 'SALARY PAYMENT DEC 2024' },
              { transaction_amount: 5000, transaction_type: 'C', transaction_date: '2024-11-10T00:00:00', description: 'Transfer from friend' },
              { transaction_amount: 30000, transaction_type: 'D', transaction_date: '2024-11-15T00:00:00', description: 'Rent payment' }
            ]
          }
        }
      };

      await new Promise(resolve => setTimeout(resolve, 1500));

      const salaryTransactions = statementResponse.data.provider_response.statement_list
        .filter(t => t.transaction_type === 'C' && t.transaction_amount >= 100000)
        .sort((a, b) => b.transaction_amount - a.transaction_amount);

      const verifiedSalary = salaryTransactions.length >= 3 ? salaryTransactions[0].transaction_amount : 0;

      if (verifiedSalary === 0) {
        setStep('rejected');
        return;
      }

      const calculatedLimit = Math.min(verifiedSalary * 0.35, 500000);

      setCreditData({
        accountName: accountLookup.data.provider_response.account_name,
        accountNumber: accountLookup.data.provider_response.account_number,
        bankName: accountLookup.data.provider_response.bank_name,
        verifiedSalary: verifiedSalary,
        creditLimit: Math.floor(calculatedLimit),
        maxSingleDebit: Math.floor(calculatedLimit)
      });

      setStep('approved');
      
    } catch (error) {
      console.error('Verification error:', error);
      setStep('rejected');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  // Consent Screen - Compact Two-Column Layout
  if (step === 'consent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start gap-6">
              {/* Left Column - Header & Authorizations */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Access Your Credit</h1>
                    <p className="text-gray-600 text-sm">Review and agree to our terms to unlock your credit limit</p>
                  </div>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">Important: Please Provide Accurate Information</h3>
                      <p className="text-xs text-gray-700">All data will be verified through our banking partners. False or inaccurate data can lead to credit decline.</p>
                    </div>
                  </div>
                </div>

                {/* Authorizations */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">By proceeding, you authorize us to:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">
                        <strong>Access financial information:</strong> Bank statements and transaction history via OnePipe
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">
                        <strong>Run credit checks:</strong> Verify BVN, account details, and payment history
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">
                        <strong>Create direct debit mandate:</strong> Set up automatic monthly payments from salary account
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">
                        <strong>Share with third parties:</strong> Data sharing with OnePipe and credit bureaus for verification
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Indemnification & Consent */}
              <div className="w-96 flex-shrink-0">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">Indemnification Agreement</h3>
                  <p className="text-xs text-gray-700 mb-2">You agree to indemnify Everything Credit against any claims arising from:</p>
                  <ul className="space-y-1 text-xs text-gray-700 ml-3">
                    <li>• Credit checks and financial verification</li>
                    <li>• Data sharing with service providers</li>
                    <li>• Direct debit mandate and payment collection</li>
                    <li>• Disputes on information accuracy</li>
                  </ul>
                </div>

                {/* Consent Checkbox */}
                <div className="border-t pt-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="text-xs">
                        <span className="font-medium text-gray-900">
                          I agree to all authorizations above
                        </span>
                        <p className="text-gray-600 mt-1">
                          I consent to Everything Credit accessing my financial information, running credit checks, creating a direct debit mandate, and sharing my data with authorized service providers. I agree to the{' '}
                          <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                            Terms
                          </Link>
                          {' '}and{' '}
                          <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </Link>.
                        </p>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={handleConsent}
                    disabled={!agreed || loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Continue to Verification'}
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-3">
                    This process typically takes 30-60 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verifying Screen
  if (step === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin">
                <TrendingUp className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Information</h2>
            <p className="text-gray-600 mb-6">
              Please wait while we securely verify your account and calculate your credit limit...
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Verifying account details...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Analyzing bank statements...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Verifying salary payments...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-400">Calculating credit limit...</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              <strong className="text-blue-600">Secure:</strong> All data is encrypted and processed securely through OnePipe
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Approved Screen - Compact Two-Column
  if (step === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h1>
              <p className="text-gray-600">Your credit has been approved</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left - Credit Limit */}
              <div>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center mb-4">
                  <p className="text-blue-100 mb-2">Your Credit Limit</p>
                  <p className="text-5xl font-bold mb-4">₦{creditData.creditLimit.toLocaleString()}</p>
                  <p className="text-blue-100">Available to use immediately</p>
                </div>

                {/* What's Next */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">What's Next?</h3>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Apply for loans up to your credit limit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Shop for appliances with 1-6 month installments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Direct debit mandate created on first credit use</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Auto-debit monthly around your salary day</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right - Account Details */}
              <div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Verified Account Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-semibold text-gray-900">{creditData.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-semibold text-gray-900">{creditData.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-semibold text-gray-900">{creditData.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verified Monthly Salary:</span>
                      <span className="font-semibold text-green-600">₦{creditData.verifiedSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Single Debit:</span>
                      <span className="font-semibold text-gray-900">₦{creditData.maxSingleDebit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleContinue}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/loans')}
                    className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
                  >
                    Apply for Loan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rejected Screen
  if (step === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Verify</h2>
            <p className="text-gray-600 mb-6">
              We were unable to verify your salary information at this time. This could be due to:
            </p>
            <ul className="text-left space-y-2 mb-6 text-gray-700">
              <li>• Insufficient transaction history (less than 3 months)</li>
              <li>• No consistent salary payments detected</li>
              <li>• Account details mismatch</li>
              <li>• Temporary bank connection issues</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Need help?</strong> Contact our support team at support@everythingcredit.ng or call +234 XXX XXX XXXX
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setStep('consent')}
                className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}