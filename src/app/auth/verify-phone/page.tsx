// app/verify-phone/page.tsx - Phone Verification
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPhone() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Mock phone number (in real app, get from session/state)
  const phoneNumber = '08012345678';
  const maskedPhone = phoneNumber.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2');

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

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

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call - verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation (in real app, call /api/auth/verify-phone)
      if (otpCode === '123456') {
        // Success - redirect to BVN verification
        router.push('/verify-bvn');
      } else {
        setError('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    setError('');
    
    // Mock API call - resend OTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Show success message (in production, call /api/auth/send-otp)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Link href="/signup" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back to signup
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Everything Credit</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h2>
            <p className="text-gray-600">
              Enter the 6-digit code sent to<br />
              <span className="font-semibold text-gray-900">{maskedPhone}</span>
            </p>
          </div>

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
                className="w-12 h-14 text-center text-black text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Verifying...' : 'Verify Phone Number'}
          </button>

          {/* Resend OTP */}
          <div className="text-center text-sm">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-blue-600 hover:underline font-medium"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-gray-600">
                Resend code in <span className="font-semibold text-gray-900">{resendTimer}s</span>
              </p>
            )}
          </div>

          {/* Helper Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              <strong className="text-blue-600">For Demo:</strong> Use code <code className="px-2 py-1 bg-white rounded font-mono">123456</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}