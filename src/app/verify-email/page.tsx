// app/verify-email/page.tsx - Email Verification
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { verifyEmail, resendOTP } from '@/lib';
import { VerifyEmailData } from '@/lib/interface';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/toast';

export default function VerifyEmail() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState('');
  const { toast, showToast, hideToast } = useToast();

  // Get email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('verificationEmail');
    if (!storedEmail) {
      // If no email found, redirect to signup
      router.push('/signup');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  // Mask email for display
  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';

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
      showToast('Please enter the complete 6-digit code', 'error');
      return;
    }

    setLoading(true);

    try {
      const verifyData: VerifyEmailData = {
        email: email,
        otp: otpCode
      };

      const response = await verifyEmail(verifyData);
      
      if (response.success) {
        // Clear stored email
        localStorage.removeItem('verificationEmail');
        
        showToast('Email verified successfully! Redirecting to login...', 'success');
        
        // Delay redirect to show success message
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        showToast(response.message || 'Invalid OTP. Please try again.', 'error');
        setOtp(['', '', '', '', '', '']);
      }
   } catch (err: any) {
  showToast(err?.message || 'An error occurred. Please try again.', 'error');
  console.error('Verification error:', err);
} finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    
    try {
      const response = await resendOTP(email);
      
      if (response.success) {
        showToast('OTP resent successfully! Check your email.', 'success');
      } else {
        showToast(response.message || 'Failed to resend OTP', 'error');
        setCanResend(true);
        setResendTimer(0);
      }
    } catch (err) {
      showToast('Failed to resend code. Please try again.', 'error');
      console.error('Resend OTP error:', err);
      setCanResend(true);
      setResendTimer(0);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={hideToast} 
      />
      
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
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Everything Credit</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
              <p className="text-gray-600">
                Enter the 6-digit code sent to<br />
                <span className="font-semibold text-gray-900">{maskedEmail}</span>
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
                  disabled={loading}
                  className="w-12 h-14 text-center text-black text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.join('').length !== 6}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
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
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-700 text-center">
                Check your email inbox and spam folder for the verification code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}