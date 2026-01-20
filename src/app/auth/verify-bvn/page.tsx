// app/verify-bvn/page.tsx - BVN Verification
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyBVN() {
  const router = useRouter();
  const [bvn, setBvn] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'bvn' | 'otp' | 'verifying'>('bvn');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBvnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bvn.length !== 11) {
      setError('BVN must be 11 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call - verify BVN
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response - OnePipe might require OTP
      const requiresOTP = true; // In real app, check response status
      
      if (requiresOTP) {
        setStep('otp');
      } else {
        // Direct success
        setStep('verifying');
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err) {
      setError('Failed to verify BVN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call - validate OTP for BVN
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otpCode === '123456') {
        setStep('verifying');
        // Simulate final verification
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // BVN Input Step
  if (step === 'bvn') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <Link href="/verify-phone" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Everything Credit</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
              <p className="text-gray-600">
                Enter your BVN to access the platform
              </p>
            </div>

            <form onSubmit={handleBvnSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Verification Number (BVN)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 text-black py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg tracking-wider"
                  placeholder="22123456789"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your BVN is required for identity verification and will be kept secure
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || bvn.length !== 11}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  Your BVN is encrypted and secure. We use it only for identity verification.
                </div>
              </div>
            </div>

            {/* Demo Helper */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-gray-700 text-center">
                <strong className="text-blue-600">For Demo:</strong> Use BVN <code className="px-2 py-1 bg-white rounded font-mono">22123456789</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Step
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <button 
            onClick={() => setStep('bvn')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
              <p className="text-gray-600">
                Enter the code sent to your phone<br />to verify your BVN
              </p>
            </div>

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
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleOtpSubmit}
              disabled={loading || otp.join('').length !== 6}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify BVN'}
            </button>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-gray-700 text-center">
                <strong className="text-blue-600">For Demo:</strong> Use code <code className="px-2 py-1 bg-white rounded font-mono">123456</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Final Verification Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="animate-spin">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Identity</h2>
        <p className="text-gray-600 mb-6">
          Please wait while we verify your BVN and set up your account...
        </p>
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Verifying BVN details...</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Setting up your account...</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span className="text-gray-400">Preparing dashboard...</span>
          </div>
        </div>
      </div>
    </div>
  );
}