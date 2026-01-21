// app/shop/page.tsx - Shop on Credit (Redesigned with Cart)
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShoppingCart, ArrowLeft, CheckCircle, AlertCircle, X, Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

type Step = 'browse' | 'checkout' | 'processing' | 'success';
type Category = 'all' | 'tv' | 'appliances' | 'kitchen' | 'electronics';

interface CartItem {
  product: any;
  quantity: number;
}

export default function Shop() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('browse');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [installmentPeriod, setInstallmentPeriod] = useState(3);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const user = {
    name: 'John Doe',
    hasAccessedCredit: true,
    creditLimit: 52500,
    availableCredit: 42500,
    activeLoanAmount: 10000
  };

  const products = [
    { id: 1, name: 'Samsung 43" Smart TV', price: 180000, image: '📺', category: 'tv', brand: 'Samsung', inStock: true },
    { id: 2, name: 'LG 8kg Washing Machine', price: 150000, image: '🧺', category: 'appliances', brand: 'LG', inStock: true },
    { id: 3, name: 'Hisense Double Door Fridge', price: 220000, image: '❄️', category: 'appliances', brand: 'Hisense', inStock: true },
    { id: 4, name: 'Binatone Microwave', price: 45000, image: '🔥', category: 'kitchen', brand: 'Binatone', inStock: true },
    { id: 5, name: 'Nexus Gas Cooker', price: 85000, image: '🍳', category: 'kitchen', brand: 'Nexus', inStock: true },
    { id: 6, name: 'Thermocool Generator', price: 180000, image: '⚡', category: 'electronics', brand: 'Thermocool', inStock: true },
    { id: 7, name: 'Sony Home Theater', price: 95000, image: '🔊', category: 'electronics', brand: 'Sony', inStock: true },
    { id: 8, name: 'LG 55" 4K Smart TV', price: 320000, image: '📺', category: 'tv', brand: 'LG', inStock: true }
  ];

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'tv', name: 'TVs' },
    { id: 'appliances', name: 'Appliances' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'electronics', name: 'Electronics' }
  ];

  const filteredProducts = selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const serviceFee = cartTotal * 0.03;
  const totalWithFee = cartTotal + serviceFee;
  const monthlyPayment = totalWithFee / installmentPeriod;

  const getErrorMessage = () => {
    if (monthlyPayment > user.availableCredit) {
      const suggestedMonths = Math.ceil(totalWithFee / user.availableCredit);
      return `Monthly payment (₦${Math.ceil(monthlyPayment).toLocaleString()}) exceeds your available credit of ₦${user.availableCredit.toLocaleString()}. Try selecting ${suggestedMonths} months (₦${Math.ceil(totalWithFee / suggestedMonths).toLocaleString()}/month) or remove some items.`;
    }
    const maxPurchasable = user.availableCredit * 6;
    if (totalWithFee > maxPurchasable) {
      return `Total amount (₦${Math.ceil(totalWithFee).toLocaleString()}) exceeds your maximum purchasable limit of ₦${maxPurchasable.toLocaleString()} (6 × ₦${user.availableCredit.toLocaleString()}). Please remove some items.`;
    }
    return null;
  };

  const handleCheckout = async () => {
    const error = getErrorMessage();
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setStep('success');
    } catch (error) {
      alert('Failed to process order');
      setStep('browse');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'browse') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Shop on Credit</h1>
            <button onClick={() => setShowCart(!showCart)} className="relative p-2">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-4">
          {user.hasAccessedCredit ? (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600">Available</p>
                <p className="text-lg font-bold text-green-600">₦{user.availableCredit.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600">Cart Total</p>
                <p className="text-lg font-bold text-blue-600">₦{Math.ceil(totalWithFee).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600">Monthly</p>
                <p className="text-lg font-bold text-gray-900">₦{Math.ceil(monthlyPayment).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-600 rounded-lg p-4 text-white mb-4">
              <p className="font-semibold mb-2">Access Credit First</p>
              <Link href="/access-credit" className="text-sm underline">Get your credit limit →</Link>
            </div>
          )}

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as Category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-3 text-center bg-gray-50">
                  <div className="text-4xl mb-2">{product.image}</div>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{product.brand}</span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-lg font-bold text-blue-600 mb-2">₦{product.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mb-2">from ₦{Math.ceil((product.price * 1.03) / 6).toLocaleString()}/mo</p>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!user.hasAccessedCredit}
                    className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCart(false)}>
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold">Cart ({cart.length})</h2>
                <button onClick={() => setShowCart(false)}><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4" style={{maxHeight: 'calc(100vh - 250px)'}}>
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                        <div className="text-3xl">{item.product.image}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.product.name}</h4>
                          <p className="text-blue-600 font-bold">₦{item.product.price.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 border rounded flex items-center justify-center">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 border rounded flex items-center justify-center">
                              <Plus className="w-3 h-3" />
                            </button>
                            <button onClick={() => removeFromCart(item.product.id)} className="ml-auto text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-4 space-y-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">₦{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee (3%):</span>
                      <span className="font-semibold">₦{Math.ceil(serviceFee).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">₦{Math.ceil(totalWithFee).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Payment Period</label>
                    <select 
                      value={installmentPeriod}
                      onChange={(e) => setInstallmentPeriod(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      {[1,2,3,4,5,6].map(m => (
                        <option key={m} value={m}>{m} month{m>1?'s':''} - ₦{Math.ceil(totalWithFee/m).toLocaleString()}/mo</option>
                      ))}
                    </select>
                  </div>

                  {getErrorMessage() && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
                      {getErrorMessage()}
                    </div>
                  )}

                  <button
                    onClick={() => { setShowCart(false); setStep('checkout'); }}
                    disabled={!!getErrorMessage()}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setStep('browse')} className="flex items-center gap-2 text-gray-600 mb-4">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          
          <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span className="font-semibold">₦{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>₦{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Fee (3%):</span><span>₦{Math.ceil(serviceFee).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span><span className="text-blue-600">₦{Math.ceil(totalWithFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between"><span>Installments:</span><span>{installmentPeriod} months</span></div>
              <div className="flex justify-between font-bold text-green-600">
                <span>Monthly:</span><span>₦{Math.ceil(monthlyPayment).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
            <p className="font-semibold mb-1">⚠️ Delivery Policy</p>
            <p className="text-gray-700">Items will be delivered after 50% of payments are completed.</p>
          </div>

          <button onClick={handleCheckout} disabled={loading} className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">
            {loading ? 'Processing...' : 'Complete Purchase'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Processing Order</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Order Confirmed! 🎉</h1>
          <p className="text-gray-600 text-center mb-6">Your order has been placed successfully</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Items:</span><span className="font-semibold">{cart.length}</span></div>
            <div className="flex justify-between"><span>Total:</span><span className="font-semibold">₦{Math.ceil(totalWithFee).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Monthly:</span><span className="font-bold text-green-600">₦{Math.ceil(monthlyPayment).toLocaleString()}</span></div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs space-y-1">
            <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />Delivery after 50% payments</p>
            <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />Auto-debit monthly</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard')} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold">
              Dashboard
            </button>
            <button onClick={() => { setStep('browse'); setCart([]); }} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold">
              Shop More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}