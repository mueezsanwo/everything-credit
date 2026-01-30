// app/page.tsx - Landing Page
'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Everything Credit</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Login
            </Link>
            <Link 
              href="/signup"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Credit Made Simple for <span className="text-blue-600">Salary Earners</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get instant access to credit based on your salary. Buy appliances on installment or get quick loans with hassle-free repayment.
          </p>
          <Link 
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Start Application <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">Get approved in minutes • Up to ₦500,000 credit</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">35%</div>
            <div className="text-gray-600">Of your monthly salary as credit</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">₦500K</div>
            <div className="text-gray-600">Maximum credit limit</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">1-6</div>
            <div className="text-gray-600">Flexible payment months</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Everything Credit?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Approval</h3>
              <p className="text-gray-600">Get approved in minutes by verifying your salary through secure bank statement analysis.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure & Trusted</h3>
              <p className="text-gray-600">Your data is protected with bank-level security. We use OnePipe's secure infrastructure.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexible Repayment</h3>
              <p className="text-gray-600">Auto-debit from your salary account. No stress, no missed payments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Sign Up', desc: 'Provide your details and salary information' },
            { step: 2, title: 'Verify Income', desc: 'We securely verify your salary via bank statement' },
            { step: 3, title: 'Get Approved', desc: 'Receive your credit limit instantly' },
            { step: 4, title: 'Shop or Borrow', desc: 'Buy appliances or get a quick loan' }
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of Nigerians accessing credit the smart way</p>
          <Link 
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-semibold text-lg shadow-xl"
          >
            Apply Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 Everything Credit. Powered by OnePipe.</p>
        </div>
      </footer>
    </div>
  );
}