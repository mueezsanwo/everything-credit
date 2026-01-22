// app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  LogOut,
  CreditCard
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    usersWithCredit: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalPurchases: 0,
    activePurchases: 0,
    totalDisbursed: 0,
    totalOutstanding: 0,
    pendingPayments: 0
  });
  const [collectingPayments, setCollectingPayments] = useState(false);

  useEffect(() => {
    // Check if user is admin (mock check)
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      router.push('/login');
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // TODO: Call /api/admin/stats when implemented
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 156,
        verifiedUsers: 142,
        usersWithCredit: 98,
        totalLoans: 45,
        activeLoans: 23,
        totalPurchases: 67,
        activePurchases: 34,
        totalDisbursed: 8500000,
        totalOutstanding: 3200000,
        pendingPayments: 12
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectPayments = async () => {
    if (!confirm('Are you sure you want to trigger payment collection?')) {
      return;
    }

    setCollectingPayments(true);
    try {
      const response = await fetch('/api/cron/collect-payments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'demo-secret'}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Payment collection completed!\n\nTotal: ${data.results.total}\nSuccessful: ${data.results.successful}\nFailed: ${data.results.failed}\nSkipped: ${data.results.skipped}`);
        fetchStats(); // Refresh stats
      } else {
        alert('Payment collection failed: ' + data.error);
      }
    } catch (error) {
      console.error('Payment collection error:', error);
      alert('Failed to collect payments');
    } finally {
      setCollectingPayments(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Everything Credit Administration</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Users Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Users</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">
                {stats.verifiedUsers} verified • {stats.usersWithCredit} with credit
              </p>
            </div>
          </div>

          {/* Loans Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Loans</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.totalLoans}</p>
              <p className="text-sm text-gray-600">
                {stats.activeLoans} active
              </p>
            </div>
          </div>

          {/* Purchases Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Purchases</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.totalPurchases}</p>
              <p className="text-sm text-gray-600">
                {stats.activePurchases} active
              </p>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Pending</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</p>
              <p className="text-sm text-gray-600">
                payments due
              </p>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8" />
              <h3 className="text-xl font-bold">Total Disbursed</h3>
            </div>
            <p className="text-4xl font-bold mb-2">₦{(stats.totalDisbursed).toLocaleString()}</p>
            <p className="text-blue-100 text-sm">All-time loan disbursements</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-8 h-8" />
              <h3 className="text-xl font-bold">Total Outstanding</h3>
            </div>
            <p className="text-4xl font-bold mb-2">₦{(stats.totalOutstanding).toLocaleString()}</p>
            <p className="text-orange-100 text-sm">Pending repayments</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Actions</h3>
          
          <div className="space-y-4">
            {/* Manual Payment Collection */}
            <div className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Collect Due Payments</h4>
                <p className="text-sm text-gray-600">
                  Manually trigger payment collection for all due payments. This will call OnePipe Collect API for each pending payment.
                </p>
              </div>
              <button
                onClick={handleCollectPayments}
                disabled={collectingPayments}
                className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {collectingPayments ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Collect Now
                  </>
                )}
              </button>
            </div>

            {/* Refresh Stats */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Refresh Statistics</h4>
                <p className="text-sm text-gray-600">
                  Reload the latest statistics from the database.
                </p>
              </div>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="ml-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">Admin Dashboard - Demo Version</p>
              <p>This is a minimal admin dashboard for assessment purposes. In production, you would add:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>User management (search, view details, suspend accounts)</li>
                <li>Loan approval workflow</li>
                <li>Payment monitoring and dispute resolution</li>
                <li>Detailed analytics and reports</li>
                <li>Export functionality (CSV, PDF)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}