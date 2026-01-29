'use client';

import React, { useState, useEffect } from 'react';
import { Users, Eye, CreditCard, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { getAdminUsers, getAdminUserDetails, collectPaymentNow } from '@/lib';
import { AdminUser, AdminUserDetails, UserPurchaseDetails } from '@/lib/interface';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/toast';

export default function AdminDashboard() {
  const { toast, showToast, hideToast } = useToast();
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetails | null>(null);
  const [userPurchases, setUserPurchases] = useState<UserPurchaseDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [collectingPayment, setCollectingPayment] = useState<string | null>(null);

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers();
      if (response.success) {
        setUsers(response.users);
      } else {
        showToast('Failed to load users', 'error');
      }
    } catch (error: any) {
      showToast(error?.message || 'Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setDetailsLoading(true);
    try {
      const response = await getAdminUserDetails(userId);
      console.log('Full response:', JSON.stringify(response, null, 2));
      
      if (response.success || response.user) {
        // Extract user data - handle MongoDB _doc wrapper
        let userData = response.user;
        
        // If user has _doc property, use that instead
        if (userData?._doc) {
          userData = userData._doc;
        }
        
        console.log('Extracted user data:', userData);
        
        // Extract purchases - could be in multiple places
        let purchasesData = response.purchases || userData?.purchases || [];
        console.log('Extracted purchases:', purchasesData);
        
        if (userData) {
          setSelectedUser(userData);
          setUserPurchases(purchasesData);
        } else {
          showToast('No user data found', 'error');
        }
      } else {
        showToast('Failed to load user details', 'error');
      }
    } catch (error: any) {
      console.error('User details error:', error);
      showToast(error?.message || 'Error loading user details', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCollectPayment = async (paymentId: string) => {
    setCollectingPayment(paymentId);
    try {
      const response = await collectPaymentNow(paymentId);
      showToast(response.message, response.message.includes('success') ? 'success' : 'error');
      
      // Refresh user details after collection attempt
      if (selectedUser) {
        await fetchUserDetails(selectedUser._id);
      }
    } catch (error: any) {
      showToast(error?.message || 'Failed to collect payment', 'error');
    } finally {
      setCollectingPayment(null);
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setUserPurchases([]);
    fetchUsers();
  };

  // User Details View
  if (selectedUser) {
    return (
      <>
        <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
        
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={handleBackToUsers}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Users
              </button>
              
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h1>
                  <p className="text-slate-400">{selectedUser.email}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-slate-400 mb-1">Available Credit</p>
                  <p className="text-2xl font-bold text-green-400">₦{(selectedUser.availableCredit || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {detailsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : (
              <>
                {/* User Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Company</p>
                    <p className="font-semibold">{selectedUser.companyName}</p>
                    <p className="text-sm text-slate-400 mt-1">{selectedUser.occupation}</p>
                  </div>
                  
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Monthly Salary</p>
                    <p className="font-semibold text-lg">₦{(selectedUser.monthlySalary || 0).toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Bank Account</p>
                    <p className="font-semibold">{selectedUser.bankName}</p>
                    <p className="text-sm text-slate-400 mt-1">{selectedUser.accountNumber}</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedUser.emailVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    Email {selectedUser.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedUser.bvnVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    BVN {selectedUser.bvnVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedUser.hasMandateCreated ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    Mandate {selectedUser.hasMandateCreated ? 'Created' : 'Pending'}
                  </span>
                </div>

                {/* Purchases Section */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Purchases & Payments</h2>
                  
                  {!userPurchases || userPurchases.length === 0 ? (
                    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
                      <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p className="text-slate-400">No purchases yet</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userPurchases.map((purchase) => (
                        <div key={purchase._id} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
                          {/* Purchase Header */}
                          <div className="p-6 border-b border-slate-700/50">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p className="text-sm text-slate-400 mb-1">Purchase ID</p>
                                <p className="font-mono text-sm">{purchase.purchaseId}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                purchase.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {purchase.status}
                              </span>
                            </div>
                            
                            {/* Items */}
                            <div className="space-y-2 mb-4">
                              {purchase.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{item.image}</span>
                                    <span>{item.name}</span>
                                  </div>
                                  <span className="text-slate-400">₦{item.price.toLocaleString()} x {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                            
                            {/* Financial Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700/30">
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Total Repayment</p>
                                <p className="font-semibold">₦{purchase.totalRepayment.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Monthly Payment</p>
                                <p className="font-semibold">₦{purchase.monthlyPayment.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Total Paid</p>
                                <p className="font-semibold text-green-400">₦{purchase.totalPaid.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Outstanding</p>
                                <p className="font-semibold text-orange-400">₦{purchase.remainingBalance.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>

                          {/* Payment Schedule */}
                          <div className="p-6">
                            <h3 className="font-semibold mb-3">Payment Schedule</h3>
                            <div className="space-y-3">
                              {purchase.payments.map((payment) => (
                                <div key={payment._id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-sm font-medium">Payment {payment.paymentNumber}</span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        payment.status === 'paid' 
                                          ? 'bg-green-500/20 text-green-400'
                                          : payment.status === 'pending'
                                          ? 'bg-yellow-500/20 text-yellow-400'
                                          : 'bg-red-500/20 text-red-400'
                                      }`}>
                                        {payment.status}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-400 space-y-1">
                                      <p>Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                                      <p>Amount: ₦{payment.amount.toLocaleString()}</p>
                                      {payment.transactionRef && (
                                        <p className="font-mono">Ref: {payment.transactionRef}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {payment.status === 'pending' && (
                                    <button
                                      onClick={() => handleCollectPayment(payment._id)}
                                      disabled={collectingPayment === payment._id}
                                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                      {collectingPayment === payment._id ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          Collecting...
                                        </>
                                      ) : (
                                        <>
                                          <CreditCard className="w-4 h-4" />
                                          Collect Now
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  // Users List View
  return (
    <>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-slate-400">Manage users and their credit purchases</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <p className="text-sm text-slate-400 mb-1">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <p className="text-sm text-slate-400 mb-1">Users with Credit</p>
                  <p className="text-3xl font-bold text-green-400">
                    {users.filter(u => u.availableCredit > 0).length}
                  </p>
                </div>
                
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <p className="text-sm text-slate-400 mb-1">Active Purchases</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {users.reduce((acc, u) => acc + u.purchases.length, 0)}
                  </p>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/50 border-b border-slate-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Available Credit</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Purchases</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium">{user.name}</p>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-semibold ${user.availableCredit > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                              ₦{user.availableCredit.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-medium">
                              {user.purchases.length} {user.purchases.length === 1 ? 'purchase' : 'purchases'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => fetchUserDetails(user._id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}