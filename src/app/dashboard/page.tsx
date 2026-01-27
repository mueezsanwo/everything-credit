'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShoppingBag, Wallet, Zap, TrendingUp, Lock, LogOut, User, Menu, X, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // ✅ pull user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ✅ safe fallback to avoid blank screen
  const safeUser = user ?? {
    firstName: '',
    lastName: '',
    email: '',
    hasAccessedCredit: false,
    creditLimit: 0,
    availableCredit: 0,
  };

  const handleAccessCredit = () => {
    router.push('/access-credit');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Everything Credit</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link href="/shop" className="text-gray-700 hover:text-blue-600 font-medium">
                Shop
              </Link>
              <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <User className="w-5 h-5" />
                <span className="font-medium">
                  {safeUser.firstName} {safeUser.lastName}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link href="/dashboard" className="block text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link href="/shop" className="block text-gray-700 hover:text-blue-600 font-medium">
                Shop
              </Link>
              <Link href="/profile" className="block text-gray-700 hover:text-blue-600 font-medium">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {safeUser.firstName}! 👋
          </h1>
          <p className="text-gray-600">Manage your credit and shop with ease</p>
        </div>

        {!safeUser.hasAccessedCredit ? (
          <>
            {/* Unlock Credit Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-start justify-between flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Unlock Your Credit</h2>
                  </div>
                  <p className="text-blue-100 mb-6 max-w-xl">
                    Get instant access to credit based on your salary. Start shopping for your favorite products today!
                  </p>
                  <button
                    onClick={handleAccessCredit}
                    className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Access Credit Now
                  </button>
                </div>
                <div className="flex-shrink-0">
                  <CreditCard className="w-32 h-32 text-blue-200 opacity-50" />
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-white rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Access Credit</h3>
                  <p className="text-gray-600 text-sm">Provide your BVN and consent to unlock your credit limit</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Shop Products</h3>
                  <p className="text-gray-600 text-sm">Browse and purchase from our wide selection of products</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pay Later</h3>
                  <p className="text-gray-600 text-sm">Automatic deductions from your salary account</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Credit Overview */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 text-sm">Credit Limit</p>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  ₦{safeUser.creditLimit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total available credit</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 text-sm">Available Credit</p>
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  ₦{safeUser.availableCredit.toLocaleString()}
                </p>
                <p className="text-sm text-green-700">Ready to spend</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => router.push('/shop')}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-8 text-left transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <ShoppingBag className="w-12 h-12" />
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Shop Now</h3>
                <p className="text-blue-100">Browse our collection of electronics and appliances</p>
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 text-left transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-12 h-12 text-gray-700" />
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Transactions</h3>
                <p className="text-gray-600">View your purchase history and repayments</p>
              </button>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Benefits</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Instant Approval</h4>
                    <p className="text-sm text-gray-600">Get your credit activated in minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Flexible Repayment</h4>
                    <p className="text-sm text-gray-600">Automatic deductions from your salary</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Wide Selection</h4>
                    <p className="text-sm text-gray-600">Choose from top electronics and appliances</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Secure & Safe</h4>
                    <p className="text-sm text-gray-600">Bank-level security for your data</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Shop CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between flex-col md:flex-row gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to Shop?</h2>
              <p className="text-purple-100">Explore our collection of quality products and start shopping today!</p>
            </div>
            <button
              onClick={() => router.push('/shop')}
              className="px-8 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              Browse Products
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}