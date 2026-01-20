// app/payments/page.tsx - Payment Tracker (Compact with Delivery Status)
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft, CheckCircle, Clock, AlertCircle, Package, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

type PaymentStatus = 'pending' | 'paid' | 'overdue';
type DeliveryStatus = 'processing' | 'pending_payment' | 'in_transit' | 'delivered';

export default function Payments() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const user = {
    creditLimit: 52500,
    availableCredit: 22500,
    totalOutstanding: 30000
  };

  const items = [
    {
      id: 'PUR1704234567',
      type: 'purchase',
      name: 'Samsung 43" Smart TV',
      amount: 180000,
      fee: 5400,
      totalRepayment: 185400,
      monthlyPayment: 61800,
      installments: 3,
      date: '2024-12-20',
      deliveryStatus: 'delivered' as DeliveryStatus,
      payments: [
        { id: 1, dueDate: '2025-01-25', amount: 61800, status: 'paid' as PaymentStatus, paidDate: '2025-01-25' },
        { id: 2, dueDate: '2025-02-25', amount: 61800, status: 'pending' as PaymentStatus, paidDate: null },
        { id: 3, dueDate: '2025-03-25', amount: 61800, status: 'pending' as PaymentStatus, paidDate: null }
      ]
    },
    {
      id: 'LN1704123456',
      type: 'loan',
      name: 'Quick Loan',
      amount: 10000,
      fee: 500,
      totalRepayment: 10500,
      monthlyPayment: 10500,
      date: '2025-01-05',
      deliveryStatus: null,
      payments: [
        { id: 1, dueDate: '2025-02-05', amount: 10500, status: 'pending' as PaymentStatus, paidDate: null }
      ]
    },
    {
      id: 'PUR1703987654',
      type: 'purchase',
      name: 'LG Washing Machine',
      amount: 150000,
      fee: 4500,
      totalRepayment: 154500,
      monthlyPayment: 77250,
      installments: 2,
      date: '2024-11-10',
      deliveryStatus: 'pending_payment' as DeliveryStatus,
      payments: [
        { id: 1, dueDate: '2024-12-10', amount: 77250, status: 'paid' as PaymentStatus, paidDate: '2024-12-10' },
        { id: 2, dueDate: '2025-01-10', amount: 77250, status: 'pending' as PaymentStatus, paidDate: null }
      ]
    }
  ];

  const totalPaid = items.reduce((sum, item) => 
    sum + item.payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0), 0
  );

  const upcomingPayments = items
    .flatMap(item => item.payments.filter(p => p.status === 'pending').map(p => ({ ...p, itemName: item.name })))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const nextPayment = upcomingPayments[0];

  const getDeliveryInfo = (item: any) => {
    if (item.type === 'loan') return null;
    const paidCount = item.payments.filter((p: any) => p.status === 'paid').length;
    const paidPercent = (paidCount / item.payments.length) * 100;
    
    if (item.deliveryStatus === 'delivered') {
      return { status: 'delivered', text: 'Delivered', color: 'text-green-600 bg-green-100', icon: CheckCircle };
    }
    if (paidPercent >= 50 && item.deliveryStatus !== 'delivered') {
      return { status: 'in_transit', text: 'In Transit', color: 'text-blue-600 bg-blue-100', icon: Truck };
    }
    return { status: 'pending_payment', text: `Delivery after ${Math.ceil(item.installments / 2)} payments`, color: 'text-orange-600 bg-orange-100', icon: Package };
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'overdue': return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Payments</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-600">Outstanding</p>
            <p className="text-lg font-bold text-orange-600">₦{user.totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-600">Available</p>
            <p className="text-lg font-bold text-green-600">₦{user.availableCredit.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-600">Total Paid</p>
            <p className="text-lg font-bold text-blue-600">₦{totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-600">Active</p>
            <p className="text-lg font-bold text-gray-900">{items.length}</p>
          </div>
        </div>

        {/* Next Payment */}
        {nextPayment && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Next Payment Due</p>
                <p className="text-2xl font-bold">₦{nextPayment.amount.toLocaleString()}</p>
                <p className="text-blue-100 text-sm mt-1">{nextPayment.itemName} • {new Date(nextPayment.dueDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</p>
              </div>
              <Clock className="w-8 h-8 text-white/50" />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3">
          {items.map(item => {
            const isExpanded = expandedId === item.id;
            const deliveryInfo = getDeliveryInfo(item);
            const paidCount = item.payments.filter((p: any) => p.status === 'paid').length;
            const progress = (paidCount / item.payments.length) * 100;

            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {item.type === 'loan' ? 'Loan' : 'Purchase'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{item.id} • {new Date(item.date).toLocaleDateString('en-NG')}</p>
                    </div>
                    {deliveryInfo && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${deliveryInfo.color} text-xs font-medium`}>
                        <deliveryInfo.icon className="w-3 h-3" />
                        {deliveryInfo.text}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="font-semibold">₦{item.totalRepayment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Monthly</p>
                      <p className="font-semibold">₦{item.monthlyPayment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Progress</p>
                      <p className="font-semibold">{paidCount}/{item.payments.length}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="text-blue-600 text-sm font-medium flex items-center gap-1"
                  >
                    {isExpanded ? <><ChevronUp className="w-4 h-4" /> Hide Schedule</> : <><ChevronDown className="w-4 h-4" /> View Schedule</>}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {item.payments.map((payment: any) => (
                        <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(payment.status)}`}>
                              {payment.status === 'paid' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium">Payment {payment.id}/{item.payments.length}</p>
                              <p className="text-xs text-gray-600">
                                Due: {new Date(payment.dueDate).toLocaleDateString('en-NG')}
                                {payment.paidDate && ` • Paid: ${new Date(payment.paidDate).toLocaleDateString('en-NG')}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₦{payment.amount.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
          <h3 className="font-bold mb-3 text-sm">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Total Disbursed:</span><span className="font-semibold">₦{items.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Total Fees:</span><span className="font-semibold">₦{items.reduce((s, i) => s + i.fee, 0).toLocaleString()}</span></div>
            <div className="flex justify-between pt-2 border-t font-bold"><span>Total Paid:</span><span className="text-green-600">₦{totalPaid.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold"><span>Balance:</span><span className="text-orange-600">₦{(items.reduce((s, i) => s + i.totalRepayment, 0) - totalPaid).toLocaleString()}</span></div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 text-xs">
          <p className="font-semibold mb-2">Payment Info</p>
          <ul className="space-y-1 text-gray-700">
            <li>• Auto-debit from salary account monthly</li>
            <li>• Items ship after 50% payments completed</li>
            <li>• Early repayment allowed without penalty</li>
          </ul>
        </div>
      </main>
    </div>
  );
}