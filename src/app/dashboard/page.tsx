// app/dashboard/page.tsx - User Dashboard
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShoppingBag, Wallet, Zap, TrendingUp, Lock, LogOut, User, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock user data (in real app, fetch from API/session)
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    hasAccessedCredit: false, // User hasn't accessed credit yet
    creditLimit: 0,
    availableCredit: 0
  };

  // Mock products
  const loanProducts = [
    {
      id: 1,
      name: 'Quick Cash',
      description: 'Get instant cash for emergencies',
      minAmount: 10000,
      maxAmount: 100000,
      tenure: '1 month',
      fee: '5%',
      icon: Zap
    },
    {
      id: 2,
      name: 'Salary Advance',
      description: 'Advance on your next salary',
      minAmount: 20000,
      maxAmount: 200000,
      tenure: '1 month',
      fee: '5%',
      icon: Wallet
    }
  ];

  const products = [
    {
      id: 1,
      name: 'Samsung Smart TV 43"',
      price: 180000,
      image: '📺',
      installments: '1-6 months'
    },
    {
      id: 2,
      name: 'LG Washing Machine',
      price: 150000,
      image: '🧺',
      installments: '1-6 months'
    },
    {
      id: 3,
      name: 'Hisense Refrigerator',
      price: 220000,
      image: '❄️',
      installments: '1-6 months'
    },
    {
      id: 4,
      name: 'Binatone Microwave',
      price: 45000,
      image: '🔥',
      installments: '1-6 months'
    }
  ];

  const handleAccessCredit = () => {
    router.push('/access-credit');
  };

  const handleLogout = () => {
    // Clear session
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

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link href="/loans" className="text-gray-700 hover:text-blue-600 font-medium">
                Loans
              </Link>
              <Link href="/shop" className="text-gray-700 hover:text-blue-600 font-medium">
                Shop
              </Link>
              <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <User className="w-5 h-5" />
                <span className="font-medium">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col gap-4">
                <Link href="/dashboard" className="text-gray-700 font-medium">Home</Link>
                <Link href="/loans" className="text-gray-700 font-medium">Loans</Link>
                <Link href="/shop" className="text-gray-700 font-medium">Shop</Link>
                <Link href="/profile" className="text-gray-700 font-medium">Profile</Link>
                <button onClick={handleLogout} className="text-red-600 font-medium text-left">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">Browse our products or get instant credit</p>
        </div>

        {/* Credit Status Card */}
        {!user.hasAccessedCredit ? (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Unlock Your Credit</h2>
                </div>
                <p className="text-blue-100 mb-6 max-w-xl">
                  Get instant access to credit based on your salary. Buy appliances on installment or get quick loans.
                </p>
                <button
                  onClick={handleAccessCredit}
                  className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-lg"
                >
                  Access Credit Now
                </button>
              </div>
              <div className="hidden md:block text-6xl">💳</div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-gray-600 text-sm mb-2">Credit Limit</p>
              <p className="text-3xl font-bold text-gray-900">₦{user.creditLimit.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-gray-600 text-sm mb-2">Available Credit</p>
              <p className="text-3xl font-bold text-green-600">₦{user.availableCredit.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-gray-600 text-sm mb-2">Active Loans</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/loans')}>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Loan</h3>
            <p className="text-gray-600 mb-4">Get instant cash from ₦5,000 - ₦500,000</p>
            <p className="text-sm text-gray-500 mb-4">• 1 month repayment • 5% service fee</p>
            <div className="text-blue-600 font-medium hover:underline">
              Apply for Loan →
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/shop')}>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Shop on Credit</h3>
            <p className="text-gray-600 mb-4">Buy appliances and pay in 1-6 months</p>
            <p className="text-sm text-gray-500 mb-4">• Flexible installments • 3% service fee</p>
            <div className="text-purple-600 font-medium hover:underline">
              Browse Products →
            </div>
          </div>
        </div>

        {/* Loan Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Need Cash?</h2>
          </div>
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  5% fee
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Loan</h3>
              <p className="text-gray-600 mb-4">Get instant cash for your needs - ₦5,000 to ₦500,000</p>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Amount Range</p>
                  <p className="font-semibold text-gray-900">₦5K - ₦500K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tenure</p>
                  <p className="font-semibold text-gray-900">1 month</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Your Limit</p>
                  <p className="font-semibold text-green-600">₦{user.hasAccessedCredit ? user.availableCredit.toLocaleString() : '0'}</p>
                </div>
              </div>
              <button
                onClick={() => !user.hasAccessedCredit ? handleAccessCredit() : router.push('/loans')}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                {!user.hasAccessedCredit ? 'Access Credit ' : 'Apply for Loan'}
              </button>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Appliances</h2>
            <Link href="/shop" className="text-blue-600 font-medium hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-6xl mb-4 text-center">{product.image}</div>
                <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">₦{product.price.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mb-4">{product.installments}</p>
                <button
                  onClick={() => !user.hasAccessedCredit ? handleAccessCredit() : router.push(`/shop/${product.id}`)}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  {!user.hasAccessedCredit ? 'Access Credit' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 Everything Credit. Powered by OnePipe.</p>
        </div>
      </footer>
    </div>
  );
}