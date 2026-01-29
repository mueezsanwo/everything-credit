'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, AlertCircle, ArrowLeft, CreditCard, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/toast';
import { calculateCredit, createMandate, saveBVN } from '@/lib';

export default function AccessCredit() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [bvn, setBvn] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<'consent' | 'verified' | 'completed'>('consent');
  const [loading, setLoading] = useState(false);
  const [creditAmount, setCreditAmount] = useState(0);
  const [activationUrl, setActivationUrl] = useState<string | null>(null);

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

  // Step 1: Submit BVN and get credit limit
  const handleSubmitBvn = async () => {
    if (!agreed || bvn.length !== 11) {
      showToast('Please enter valid BVN and agree to consent', 'error');
      return;
    }

    setLoading(true);

    try {
      // Save BVN to backend first
      console.log('Saving BVN:', bvn);
      const saveBVNResponse = await saveBVN(bvn);
      console.log('Save BVN Response:', saveBVNResponse);
      
      // Check if BVN was saved successfully
      if (!saveBVNResponse || !saveBVNResponse.bvnData) {
        showToast(saveBVNResponse?.message || 'Failed to save BVN. Please try again.', 'error');
        return;
      }
      
      // Get user email from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = user.email;
      
      console.log('User email:', userEmail);
      
      if (!userEmail) {
        showToast('User email not found. Please login again.', 'error');
        router.push('/login');
        return;
      }
      
      // Calculate credit limit
      console.log('Calculating credit for:', userEmail);
      const creditResponse = await calculateCredit(userEmail);
      console.log('Credit Response:', creditResponse);
      
      // Check different possible response structures
      const limit = creditResponse?.creditLimit || creditResponse?.data?.creditLimit;
      
      if (limit && limit > 0) {
        setCreditAmount(limit);
        showToast('Credit limit calculated successfully!', 'success');
        setStep('verified');
      } else {
        console.error('Unexpected credit response:', creditResponse);
        showToast(creditResponse?.message || 'Failed to calculate credit. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Error:', error);
      showToast(error?.message || 'An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create mandate and activate credit
  const handleGetCredit = async () => {
    setLoading(true);
    
    try {
      console.log('Creating mandate...');
      // Create direct debit mandate
      const response = await createMandate();
      console.log('Mandate Response:', response);
      
      if (response.mandateRef || response.success) {
        // Extract activation URL (handle different possible casings/locations)
        const actUrl = 
          response.activationurl || 
          response.activationUrl || 
          response.providerResponse?.meta?.activation_url;

        if (actUrl) {
          setActivationUrl(actUrl);
          showToast('Mandate created! Check your email or use the link below to complete setup.', 'success');
        } else {
          showToast('Credit activated successfully!', 'success');
        }

        // Update user data in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.hasAccessedCredit = true;
        user.creditLimit = creditAmount;
        user.availableCredit = creditAmount;
        
        if (actUrl) {
          user.activationUrl = actUrl;
        }
        
        localStorage.setItem('user', JSON.stringify(user));
        
        setStep('completed');
        
        // NO auto-redirect anymore — user stays here to see message/link
      } else {
        console.error('Mandate creation failed:', response);
        showToast(response?.message || 'Failed to activate credit. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Mandate error:', error);
      showToast(error?.message || 'Failed to activate credit. Please try again.', 'error');
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
                    {loading ? 'Processing...' : 'Submit & View Credit Limit'}
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

  // Step 2: Credit Limit Display
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Credit Limit Calculated!</h2>
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

  // Step 3: Success/Completed
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

              {activationUrl && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">Complete Setup via Email</h3>
                      <p className="text-xs text-gray-700 mb-3">
                        A mandate consent email has been sent to you from PaywithAccount. 
                        Please check your inbox (and spam/junk folder) and click the link to authorize the direct debit.
                      </p>
                      <p className="text-xs text-gray-700 mb-3 font-medium">
                        Or click below to open the activation link directly:
                      </p>
                      <a
                        href={activationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                      >
                        Open Activation Link
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium mt-4"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}