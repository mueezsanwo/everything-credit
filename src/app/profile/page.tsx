// app/profile/page.tsx - User Profile
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft, Mail, Phone, Briefcase, Building2, Landmark, Shield, CreditCard, TrendingUp, Calendar, LogOut, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getUserProfile } from '@/lib';
import { GetUserProfileResponse } from '@/lib/interface';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/toast';

type Tab = 'profile' | 'credit' | 'security';

export default function Profile() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<GetUserProfileResponse['data'] | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        if (response.success && response.data) {
          setUserData(response.data);
        } else {
          showToast('Failed to load profile', 'error');
          router.push('/login');
        }
      } catch (error: any) {
        console.error('Profile fetch error:', error);
        showToast(error?.message || 'Failed to load profile', 'error');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  // Mask sensitive data
  const maskedBVN = userData.bvn ? `***${userData.bvn.slice(-4)}` : 'Not provided';
  const maskedAccount = userData.accountNumber ? `${userData.accountNumber.slice(0, 4)}****${userData.accountNumber.slice(-2)}` : 'Not provided';

  return (
    <>
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={hideToast} 
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Profile</h1>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-4">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userData.firstName} {userData.lastName}</h2>
                <p className="text-blue-100">{userData.email}</p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="px-2 py-1 bg-white/20 rounded-full">
                    {userData.status === 'active' ? '✓ Active' : 'Inactive'}
                  </span>
                  <span>Member since {new Date(userData.createdAt).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('credit')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'credit' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
              }`}
            >
              Credit Details
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
              }`}
            >
              Security
            </button>
          </div>

          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-bold text-gray-900 mb-4">Personal Information</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">First Name</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-900">{userData.firstName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Last Name</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-900">{userData.lastName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email</label>
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{userData.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Phone</label>
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{userData.phone}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Address</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-900">{userData.address || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Date of Birth</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-900">
                        {userData.dob ? new Date(userData.dob).toLocaleDateString('en-NG') : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-bold text-gray-900 mb-4">Employment Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Company</label>
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{userData.companyName || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Occupation</label>
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{userData.occupation || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Work Email</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-900">{userData.workEmail || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Monthly Salary</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-900">₦{userData.monthlySalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-bold text-gray-900 mb-4">Banking Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bank</label>
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                      <Landmark className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{userData.bankName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Account Number</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-900 font-mono">{maskedAccount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credit Details Tab */}
          {activeTab === 'credit' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Credit Limit</p>
                      <p className="text-xl font-bold text-gray-900">₦{userData.creditLimit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Available Credit</p>
                      <p className="text-xl font-bold text-green-600">₦{userData.availableCredit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Outstanding</p>
                      <p className="text-xl font-bold text-orange-600">₦{(userData.creditLimit - userData.availableCredit).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-bold text-gray-900 mb-4">Credit Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Verified Salary:</span>
                    <span className="font-semibold text-gray-900">₦{userData.verifiedSalary?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Max Single Debit:</span>
                    <span className="font-semibold text-gray-900">₦{userData.maxSingleDebit?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Mandate Status:</span>
                    <span className={`font-semibold ${userData.mandateStatus === 'ACTIVE' ? 'text-green-600' : 'text-orange-600'}`}>
                      {userData.mandateStatus || 'Not Created'}
                    </span>
                  </div>
                  {userData.mandateActivatedAt && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Mandate Activated:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(userData.mandateActivatedAt).toLocaleDateString('en-NG')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!userData.hasAccessedCredit && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm">Access Your Credit</h4>
                  <p className="text-xs text-blue-700 mb-3">You haven't accessed your credit yet. Complete your BVN verification to unlock your credit limit.</p>
                  <button 
                    onClick={() => router.push('/access-credit')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Access Credit Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-bold text-gray-900 mb-4">Verification Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Phone Number</span>
                    </div>
                    {userData.phoneVerified ? (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-sm text-orange-600 font-medium">Not Verified</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Email Address</span>
                    </div>
                    {userData.emailVerified ? (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-sm text-orange-600 font-medium">Not Verified</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">BVN Verification</span>
                    </div>
                    {userData.bvnVerified ? (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-sm text-orange-600 font-medium">Not Verified</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-bold text-gray-900 mb-4">Sensitive Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">BVN</span>
                    <span className="text-sm text-gray-900 font-mono">{maskedBVN}</span>
                  </div>
                  <p className="text-xs text-gray-500">For security, only the last 4 digits are shown</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-bold text-gray-900 mb-4">Account Activity</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(userData.lastLogin).toLocaleString('en-NG')}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Account Created:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(userData.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(userData.updatedAt).toLocaleDateString('en-NG')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}