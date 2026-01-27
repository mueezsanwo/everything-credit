'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShoppingBag, Wallet, Zap, TrendingUp, Lock, LogOut, User, Menu, X } from 'lucide-react';
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
              {/* <Link href="/loans" className="text-gray-700 hover:text-blue-600 font-medium">
                Loans
              </Link> */}
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {safeUser.firstName}! 👋
          </h1>
          <p className="text-gray-600">Browse our products or get instant credit</p>
        </div>

        {!safeUser.hasAccessedCredit ? (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Unlock Your Credit</h2>
                </div>
                <p className="text-blue-100 mb-6 max-w-xl">
                  Get instant access to credit based on your salary.
                </p>
                <button
                  onClick={handleAccessCredit}
                  className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold"
                >
                  Access Credit Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-gray-600 text-sm mb-2">Credit Limit</p>
              <p className="text-3xl font-bold text-gray-900">
                ₦{safeUser.creditLimit.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-gray-600 text-sm mb-2">Available Credit</p>
              <p className="text-3xl font-bold text-green-600">
                ₦{safeUser.availableCredit.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* PRODUCTS STILL RENDER ✅ */}
        <section>
          <div className="grid md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-6xl mb-4 text-center">{product.image}</div>
                <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  ₦{product.price.toLocaleString()}
                </p>
                <button
                  onClick={() =>
                    !safeUser.hasAccessedCredit
                      ? handleAccessCredit()
                      : router.push(`/shop/${product.id}`)
                  }
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-xl"
                >
                  {!safeUser.hasAccessedCredit ? 'Access Credit' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
