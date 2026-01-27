'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, AlertCircle, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/toast';

export default function AccessCredit() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [bvn, setBvn] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<'consent' | 'otp' | 'verified' | 'completed'>('consent');
  const [loading, setLoading] = useState(false);
  const [creditAmount, setCreditAmount] = useState(0);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Mock data
  const MOCK_OTP = '123456';
  const MOCK_CREDIT_LIMIT = 500000; // ₦500,000

  // Consent text content
  const consentText = `
Everything Credit Consent Form

By proceeding, you authorize Everything Credit to:
1. Access financial information including bank statements and salary transactions.
2. Verify your BVN, account details, and payment history.
3. Create a direct debit mandate to collect repayments from your salary account.
4. Share your data with OnePipe and credit bureaus for verification purposes.
5. Ensure compliance with all relevant data protection regulations.

You confirm that the information provided (including BVN) is accurate.
`;

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 1: Send BVN to backend
  const handleSubmitBvn = async () => {
    if (!agreed || bvn.length !== 11) {
      showToast('Please enter valid BVN and agree to consent', 'error');
      return;
    }

    setLoading(true);

    try {
      // Mock API call - simulate OTP request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast('OTP sent successfully!', 'success');
      setStep('otp');
    } catch (error) {
      console.error(error);
      showToast('An error occurred while requesting OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      showToast('Please enter complete 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Mock API call - simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate OTP
      if (otpCode === MOCK_OTP) {
        // Mock: Calculate credit limit based on user data
        setCreditAmount(MOCK_CREDIT_LIMIT);
        showToast('BVN verified successfully!', 'success');
        setStep('verified');
      } else {
        showToast('Invalid OTP. Please try again. (Use: 123456)', 'error');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error(error);
      showToast('An error occurred while verifying OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create mandate and activate credit
  const handleGetCredit = async () => {
    setLoading(true);
    
    try {
      // Mock API call - create direct debit mandate
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock: Update user's available credit
      showToast('Credit activated successfully!', 'success');
      setStep('completed');
      
      // Redirect to dashboard after showing success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error(error);
      showToast('Failed to activate credit. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Consent + BVN
  if (step === 'consent') {
    return (
      <>
        <Toast 
          show={toast.show} 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4">
              <ArrowLeft className="w-5 h-5" />
              Back to dashboard
            </Link>

            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 sm:w-7 h-6 sm:h-7 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">Access Your Credit</h1>
                      <p className="text-gray-600 text-xs sm:text-sm">Provide your BVN and consent to unlock your credit limit.</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-l-4 border-amber-400 p-3 sm:p-4 mb-4 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-gray-700">All data will be stored securely. Consent is required to access your credit limit.</p>
                      </div>
                    </div>
                  </div>

                  {/* BVN input */}
                  <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bank Verification Number (BVN)</label>
                    <input
                      type="text"
                      value={bvn}
                      onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="Enter your 11-digit BVN"
                      className="w-full text-black placeholder-gray-400 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Required to verify your identity.</p>
                  </div>

                  {/* Consent checkbox */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-4">
                    <label className="flex items-start gap-2 cursor-pointer text-xs sm:text-sm">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                        disabled={loading}
                      />
                      <span className="font-medium text-gray-900">I agree to the consent and authorize Everything Credit to access my financial information</span>
                    </label>
                  </div>

                  <button
                    onClick={handleSubmitBvn}
                    disabled={!agreed || bvn.length !== 11 || loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Request OTP'}
                  </button>
                </div>

                {/* Right Column - Consent Preview */}
                <div className="flex-shrink-0 w-full lg:w-96 h-64 lg:h-auto bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-y-auto text-xs sm:text-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Consent Preview</h3>
                  <pre className="whitespace-pre-wrap text-gray-700">{consentText}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 2: OTP Verification
  if (step === 'otp') {
    return (
      <>
        <Toast 
          show={toast.show} 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="max-w-md w-full">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8">
              <ArrowLeft className="w-5 h-5" />
              Back to dashboard
            </Link>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
                <p className="text-gray-600 mb-6">We have sent an OTP to your registered phone number.</p>

                {/* OTP Input */}
                <div className="flex gap-2 justify-center mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={loading}
                      className="w-12 h-14 text-center text-black text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.join('').length !== 6 || loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                {/* Helper Text */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-gray-700 text-center">
                    <strong className="text-blue-600">For Demo:</strong> Use code <code className="px-2 py-1 bg-white rounded font-mono">123456</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 3: Credit Limit Display
  if (step === 'verified') {
    return (
      <>
        <Toast 
          show={toast.show} 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">BVN Verified!</h2>
              <p className="text-gray-600 mb-6">You are eligible for the following credit limit:</p>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Your Credit Limit</p>
                <p className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">₦{creditAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Based on your salary and bank history</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">What happens next?</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• A direct debit mandate will be created on your salary account</li>
                  <li>• Your credit will be activated immediately</li>
                  <li>• You can start using your credit right away</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleGetCredit}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Activating Credit...' : 'Activate Credit'}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Step 4: Success/Completed
  if (step === 'completed') {
    return (
      <>
        <Toast 
          show={toast.show} 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">All Set! 🎉</h2>
              <p className="text-gray-600 mb-4">Your credit has been activated successfully.</p>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700">
                  You can now access <span className="font-bold text-green-700">₦{creditAmount.toLocaleString()}</span> in credit
                </p>
              </div>

              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}