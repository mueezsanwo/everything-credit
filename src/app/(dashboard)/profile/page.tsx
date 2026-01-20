// app/profile/page.tsx - User Profile
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft, Mail, Phone, Briefcase, Building2, Landmark, Shield, Edit2, Save, X, CreditCard, TrendingUp, Calendar, LogOut } from 'lucide-react';
import Link from 'next/link';

type Tab = 'profile' | 'credit' | 'security';

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '08012345678',
    address: '123 Main Street, Ikeja, Lagos',
    companyName: 'Tech Solutions Ltd',
    occupation: 'Software Engineer',
    workEmail: 'john.doe@techsolutions.com',
    monthlySalary: '150000'
  });

  const user = {
    ...formData,
    bvn: '221****5678',
    bankName: 'Access Bank',
    accountNumber: '01234****89',
    creditLimit: 52500,
    availableCredit: 42500,
    totalBorrowed: 340000,
    totalRepaid: 300000,
    activeLoans: 1,
    activePurchases: 1,
    joinedDate: '2024-11-15',
    lastLogin: '2025-01-11',
    accountStatus: 'active',
    creditScore: 'Good'
  };

  const handleSave = () => {
    // In real app, call API to update profile
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Clear session and redirect
    router.push('/');
  };

  return (
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
              <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-blue-100">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="px-2 py-1 bg-white/20 rounded-full">
                  {user.accountStatus === 'active' ? '✓ Active' : 'Inactive'}
                </span>
                <span>Member since {new Date(user.joinedDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}</span>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-blue-600 text-sm font-medium flex items-center gap-1">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="text-green-600 text-sm font-medium flex items-center gap-1">
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="text-red-600 text-sm font-medium flex items-center gap-1">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Email</label>
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{formData.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Phone</label>
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{formData.phone}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Phone cannot be changed</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-bold text-gray-900 mb-4">Employment Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Company</label>
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      disabled={!isEditing}
                      className="flex-1 outline-none text-sm text-gray-900 disabled:bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Occupation</label>
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      disabled={!isEditing}
                      className="flex-1 outline-none text-sm text-gray-900 disabled:bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Work Email</label>
                  <input
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Monthly Salary (₦)</label>
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-900">₦{parseInt(formData.monthlySalary).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Contact support to update</p>
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
                    <span className="text-sm text-gray-900">{user.bankName}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Account Number</label>
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-900">{user.accountNumber}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Banking details cannot be changed. Contact support if needed.</p>
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
                    <p className="text-xl font-bold text-gray-900">₦{user.creditLimit.toLocaleString()}</p>
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
                    <p className="text-xl font-bold text-green-600">₦{user.availableCredit.toLocaleString()}</p>
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
                    <p className="text-xl font-bold text-orange-600">₦{(user.creditLimit - user.availableCredit).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-bold text-gray-900 mb-4">Credit Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Credit Score:</span>
                  <span className="font-semibold text-green-600">{user.creditScore}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Active Loans:</span>
                  <span className="font-semibold text-gray-900">{user.activeLoans}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Active Purchases:</span>
                  <span className="font-semibold text-gray-900">{user.activePurchases}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Total Borrowed:</span>
                  <span className="font-semibold text-gray-900">₦{user.totalBorrowed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Total Repaid:</span>
                  <span className="font-semibold text-green-600">₦{user.totalRepaid.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">How to Increase Your Credit Limit</h4>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>• Maintain consistent monthly salary credits</li>
                <li>• Complete at least 3 successful repayments on time</li>
                <li>• Keep your repayment history clean (no defaults)</li>
                <li>• Your limit is capped at 35% of your verified salary</li>
              </ul>
            </div>
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
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Verified
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Email Address</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Verified
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">BVN Verification</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-bold text-gray-900 mb-4">Sensitive Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">BVN</span>
                  <span className="text-sm text-gray-900 font-mono">{user.bvn}</span>
                </div>
                <p className="text-xs text-gray-500">For security, only the last 4 digits are shown</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  Update Password
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-bold text-gray-900 mb-4">Account Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="font-medium text-gray-900">{new Date(user.lastLogin).toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Account Created:</span>
                  <span className="font-medium text-gray-900">{new Date(user.joinedDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2 text-sm">Danger Zone</h4>
              <p className="text-xs text-red-700 mb-3">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}