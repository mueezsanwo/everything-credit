// app/signup/page.tsx - Signup Flow
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, User, Hash, Briefcase, Building2, Mail, Landmark, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { signUp } from '@/lib';
import { SignUpData } from '@/lib/interface';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/toast';
import { getAllBanks } from '@/lib/utils/banks';

export default function Signup() {
  const router = useRouter();
  const [signupStep, setSignupStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    dob: '',
    companyName: '',
    workEmail: '',
    occupation: '',
    monthlySalary: '',
    bankName: '',
    accountNumber: '',
    isSalaryAccount: true,
    agreedToTerms: false
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    if (signupStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.password || !formData.address || !formData.dob) {
        showToast('Please fill in all required fields', 'error');
        return false;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
      }
      // Basic phone validation (Nigerian format)
      if (formData.phone.length < 11) {
        showToast('Please enter a valid phone number', 'error');
        return false;
      }
      // Password validation
      if (formData.password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return false;
      }
      // DOB validation - must be at least 18 years old
      const dob = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        showToast('You must be at least 18 years old', 'error');
        return false;
      }
    }
    
    if (signupStep === 2) {
      if (!formData.companyName || !formData.occupation || !formData.monthlySalary) {
        showToast('Please fill in all employment details', 'error');
        return false;
      }
    }
    
    if (signupStep === 3) {
      if (!formData.bankName || !formData.accountNumber) {
        showToast('Please fill in all banking details', 'error');
        return false;
      }
      if (formData.accountNumber.length !== 10) {
        showToast('Account number must be 10 digits', 'error');
        return false;
      }
      if (!formData.agreedToTerms) {
        showToast('Please agree to the terms and conditions', 'error');
        return false;
      }
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep()) return;
    
    if (signupStep < 3) {
      setSignupStep(signupStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (signupStep > 1) {
      setSignupStep(signupStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    
    try {
      const signUpData: SignUpData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        dob: formData.dob,
        companyName: formData.companyName,
        occupation: formData.occupation,
        workEmail: formData.workEmail,
        monthlySalary: Number(formData.monthlySalary),
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        isSalaryAccount: formData.isSalaryAccount,
        agreedToTerms: formData.agreedToTerms
      };

      const response = await signUp(signUpData);

      if (response.success) {
        localStorage.setItem('verificationEmail', formData.email);
        
        showToast('Account created! Please verify your email.', 'success');
        
        setTimeout(() => {
          router.push('/verify-email');
        }, 1500);
      } else {
        showToast(response.message || 'Sign up failed. An error occurred.', 'error');
      } 
    } catch (err: any) {
      const errorMessage = err?.message || 'An error occurred. Please try again.';
      showToast(errorMessage, 'error');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={hideToast} 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-4">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Everything Credit</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Credit in Minutes</h2>
              <p className="text-gray-600">Step {signupStep} of 3</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-full h-2 mb-8">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(signupStep / 3) * 100}%` }}
            />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {signupStep === 1 && <PersonalInfoStep formData={formData} updateFormData={updateFormData} loading={loading} />}
            {signupStep === 2 && <EmploymentStep formData={formData} updateFormData={updateFormData} loading={loading} />}
            {signupStep === 3 && <BankingStep formData={formData} updateFormData={updateFormData} loading={loading} />}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {signupStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNextStep}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : signupStep === 3 ? 'Submit Application' : 'Continue'}
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

// Step Components
function PersonalInfoStep({ formData, updateFormData, loading }: any) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <User className="w-6 h-6 text-blue-600" />
        Personal Information
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Provide details exactly as they appear on your BVN
      </p>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name (as on BVN)</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              placeholder="John"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name (as on BVN)</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              placeholder="Doe"
              required
              disabled={loading}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              placeholder="08012345678"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              placeholder="john@example.com"
              required
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => updateFormData('dob', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            required
            disabled={loading}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
          />
          <p className="text-xs text-gray-500 mt-1">You must be at least 18 years old</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
            placeholder="Enter your residential address"
            rows={2}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              placeholder="Create a strong password"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
        </div>
      </div>
    </div>
  );
}

function EmploymentStep({ formData, updateFormData, loading }: any) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-blue-600" />
        Employment Information
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => updateFormData('companyName', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              placeholder="Acme Corporation"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => updateFormData('occupation', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              placeholder="Software Engineer"
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work Email (Optional)</label>
          <input
            type="email"
            value={formData.workEmail}
            onChange={(e) => updateFormData('workEmail', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
            placeholder="john.doe@company.com"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Helps verify your employment</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₦)</label>
          <input
            type="number"
            value={formData.monthlySalary}
            onChange={(e) => updateFormData('monthlySalary', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
            placeholder="150000"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">We'll verify this through your bank statement</p>
        </div>
      </div>
    </div>
  );
}

function BankingStep({ formData, updateFormData, loading }: any) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const banks = getAllBanks();

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Landmark className="w-6 h-6 text-blue-600" />
        Banking Information
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <select
              value={formData.bankName}
              onChange={(e) => updateFormData('bankName', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              disabled={loading}
            >
              <option value="">Select bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => updateFormData('accountNumber', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              placeholder="0123456789"
              maxLength={10}
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isSalaryAccount}
              onChange={(e) => updateFormData('isSalaryAccount', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
              disabled={loading}
            />
            <div>
              <div className="font-medium text-gray-900 text-sm">This is my salary account</div>
              <div className="text-xs text-gray-600 mt-0.5">We'll verify your salary and collect repayments from this account</div>
            </div>
          </label>
        </div>

        {/* Terms and Conditions */}
        <div className="border-t pt-3 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  updateFormData('agreedToTerms', e.target.checked);
                }}
                className="mt-1 w-4 h-4 text-blue-600"
                required
                disabled={loading}
              />
              <div className="text-sm">
                <span className="font-medium text-gray-900">
                  I agree to the{' '}
                  <Link 
                    href="/terms" 
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link 
                    href="/privacy" 
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
                <p className="text-gray-600 mt-1 text-xs">
                  I consent to bank statement verification, direct debit mandate creation, automatic debits, and data sharing with service providers (OnePipe, etc.)
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600">
              Your banking details are encrypted and secure. We use OnePipe's bank-level security.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}