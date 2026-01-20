// app/signup/page.tsx - Signup Flow
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, User, Hash, Briefcase, Building2, Mail, Landmark, Shield, ArrowLeft } from 'lucide-react';

export default function Signup() {
  const router = useRouter();
  const [signupStep, setSignupStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
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

  const handleNextStep = () => {
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
    setLoading(true);
    // Here we'll call the API to create user account
    // For now, simulate API call
    setTimeout(() => {
      router.push('/verify-phone');
    }, 1000);
  };

  return (
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
            <p className="text-gray-600">Step {signupStep} of 4</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-full h-2 mb-8">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(signupStep / 4) * 100}%` }}
          />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {signupStep === 1 && <PersonalInfoStep formData={formData} updateFormData={updateFormData} />}
          {signupStep === 2 && <EmploymentStep formData={formData} updateFormData={updateFormData} />}
          {signupStep === 3 && <BankingStep formData={formData} updateFormData={updateFormData} />}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {signupStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNextStep}
              disabled={loading || (signupStep === 3 && !formData.agreedToTerms)}
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
  );
}

// Step Components
function PersonalInfoStep({ formData, updateFormData }: any) {
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
            />
          </div>
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
            placeholder="Create a strong password"
            required
          />
        </div>
      </div>
    </div>
  );
}

function IdentificationStep({ formData, updateFormData }: any) {
  return null; // Removed - BVN will be collected after phone verification
}

function EmploymentStep({ formData, updateFormData }: any) {
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
          />
          <p className="text-xs text-gray-500 mt-1">We'll verify this through your bank statement</p>
        </div>
      </div>
    </div>
  );
}

function BankingStep({ formData, updateFormData }: any) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
            >
              <option value="">Select bank</option>
              <option value="Access Bank">Access Bank</option>
              <option value="GTBank">GTBank</option>
              <option value="First Bank">First Bank</option>
              <option value="UBA">UBA</option>
              <option value="Zenith Bank">Zenith Bank</option>
              <option value="Kuda Bank">Kuda Bank</option>
              <option value="Wema">Wema Bank</option>
              <option value="Fidelity">Fidelity Bank</option>
              <option value="Polaris">Polaris Bank</option>
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