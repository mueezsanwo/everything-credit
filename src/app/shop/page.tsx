// app/shop/page.tsx - Shop on Credit (Redesigned with Cart)
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  ShoppingCart,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';
import Link from 'next/link';

import { getShopProducts, getUserProfile, checkout } from '@/lib';
import { CheckoutData } from '@/lib/interface';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/toast';

type Step = 'browse' | 'checkout' | 'processing' | 'success';
type Category = 'all' | 'tv' | 'appliances' | 'kitchen' | 'electronics';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: Category;
  brand: string;
  inStock: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface UserProfile {
  firstName: string;
  hasAccessedCredit: boolean;
  creditLimit: number;
  availableCredit: number;
  address: string;
}

interface PurchaseData {
  purchaseId: string;
  totalRepayment: number;
  monthlyPayment: number;
  installments: number;
  firstPaymentDate: string;
}

export default function Shop() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [step, setStep] = useState<Step>('browse');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [installmentPeriod, setInstallmentPeriod] = useState(3);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);

  /* ================= FETCH REAL DATA ================= */
  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, productsRes] = await Promise.all([
          getUserProfile(),
          getShopProducts(),
        ]);

        setUser({
          firstName: profileRes.data.firstName,
          hasAccessedCredit: profileRes.data.hasAccessedCredit,
          creditLimit: profileRes.data.creditLimit,
          availableCredit: profileRes.data.availableCredit,
          address: profileRes.data.address,
        });

        setDeliveryAddress(profileRes.data.address || '');
        setProducts(productsRes.products);
      } catch (error: any) {
        console.error('Failed to load shop data', error);
        showToast(error?.message || 'Failed to load shop data', 'error');
      } finally {
        setInitialLoading(false);
      }
    }

    loadData();
  }, []);

  /* ================= SKELETON LOADER ================= */
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="w-20 h-6 bg-gray-400 animate-pulse rounded" />
            <div className="w-32 h-6 bg-gray-400 animate-pulse rounded" />
            <div className="w-8 h-8 bg-gray-400 animate-pulse rounded-full" />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-3 h-16 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  /* ================= STATIC DATA ================= */
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'tv', name: 'TVs' },
    { id: 'appliances', name: 'Appliances' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'electronics', name: 'Electronics' },
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  /* ================= CART LOGIC ================= */
  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            return {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const serviceFee = cartTotal * 0.08;
  const totalWithFee = cartTotal + serviceFee;
  const monthlyPayment = totalWithFee / installmentPeriod;

  const getErrorMessage = () => {
    if (monthlyPayment > user.availableCredit) {
      const suggestedMonths = Math.ceil(
        totalWithFee / user.availableCredit
      );
      return `Monthly payment (₦${Math.ceil(
        monthlyPayment
      ).toLocaleString()}) exceeds your available credit of ₦${user.availableCredit.toLocaleString()}. Try selecting ${suggestedMonths} months.`;
    }

    const maxPurchasable = user.availableCredit * 6;
    if (totalWithFee > maxPurchasable) {
      return `Total amount exceeds your maximum purchasable limit.`;
    }

    return null;
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      showToast('Please enter a delivery address', 'error');
      return;
    }

    const error = getErrorMessage();
    if (error) {
      showToast(error, 'error');
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      const checkoutData: CheckoutData = {
        installmentPeriod,
        deliveryAddress: deliveryAddress.trim(),
        cartItems: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      const response = await checkout(checkoutData);

      if (response.success) {
        setPurchaseData({
          purchaseId: response.purchase.purchaseId,
          totalRepayment: response.purchase.totalRepayment,
          monthlyPayment: response.purchase.monthlyPayment,
          installments: response.purchase.installments,
          firstPaymentDate: response.purchase.firstPaymentDate
        });
        showToast('Purchase successful!', 'success');
        setStep('success');
      } else {
        showToast(response.message || 'Purchase failed', 'error');
        setStep('checkout');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      showToast(error?.message || 'Failed to process order', 'error');
      setStep('checkout');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'browse') {
    return (
      <>
        <Toast 
          show={toast.show} 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
        
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
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
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
                      className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
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
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                  <h2 className="text-lg font-bold text-black">Your Cart ({cart.length})</h2>
                  <button onClick={() => setShowCart(false)}><X className="w-5 h-5 text-black" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4" style={{maxHeight: 'calc(100vh - 250px)'}}>
                  {cart.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Cart is empty</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg border">
                          <div className="text-3xl">{item.product.image}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-black">{item.product.name}</h4>
                            <p className="text-blue-600 font-bold">₦{item.product.price.toLocaleString()}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 border rounded flex items-center justify-center text-black hover:bg-gray-100">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-black font-medium">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 border rounded flex items-center justify-center text-black hover:bg-gray-100">
                                <Plus className="w-3 h-3" />
                              </button>
                              <button onClick={() => removeFromCart(item.product.id)} className="ml-auto text-red-600 hover:text-red-700">
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
                  <div className="border-t p-4 space-y-3 bg-gray-50">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-black">Subtotal:</span>
                        <span className="font-semibold text-gray-900">₦{cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Service Fee (8%):</span>
                        <span className="font-semibold text-black">₦{Math.ceil(serviceFee).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span className="text-black">Total:</span>
                        <span className="text-blue-600">₦{Math.ceil(totalWithFee).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-black mb-1 block font-medium">Payment Period</label>
                      <select 
                        value={installmentPeriod}
                        onChange={(e) => setInstallmentPeriod(Number(e.target.value))}
                        className="w-full text-black px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  if (step === 'checkout') {
    return (
      <>
        <Toast 
          show={toast.show} 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
        
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep('browse')} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            
            <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
              <h2 className="text-xl text-black font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-black">{item.product.name} x{item.quantity}</span>
                    <span className="font-semibold text-black">₦{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="text-gray-900">₦{cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Fee (8%):</span><span className="text-gray-900">₦{Math.ceil(serviceFee).toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span className="text-black">Total:</span><span className="text-blue-600">₦{Math.ceil(totalWithFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between"><span className="text-black">Installments:</span><span className="text-gray-900">{installmentPeriod} months</span></div>
                <div className="flex justify-between font-bold text-green-600">
                  <span>Monthly:</span><span>₦{Math.ceil(monthlyPayment).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
              <h3 className="font-bold text-black mb-3">Delivery Address</h3>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
                className="w-full text-black placeholder:text-gray-700 px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows={3}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold mb-1">⚠️ Delivery Policy</p>
              <p className="text-black">Items will be delivered after 50% of payments are completed.</p>
            </div>

            <button onClick={handleCheckout} disabled={loading} className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors">
              {loading ? 'Processing...' : 'Complete Purchase'}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (step === 'processing') {
    return (
      <>
        <Toast 
          show={toast.show} 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
        
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Processing Order</h2>
            <p className="text-gray-600">Please wait while we process your purchase...</p>
          </div>
        </div>
      </>
    );
  }

  if (step === 'success' && purchaseData) {
    return (
      <>
        <Toast 
          show={toast.show} 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
        
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Order Confirmed! 🎉</h1>
            <p className="text-gray-600 text-center mb-6">Your order has been placed successfully</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Purchase ID:</span><span className="font-mono font-semibold">{purchaseData.purchaseId}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Items:</span><span className="font-semibold">{cart.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-semibold">₦{purchaseData.totalRepayment.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Installments:</span><span className="font-semibold">{purchaseData.installments} months</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Monthly:</span><span className="font-bold text-green-600">₦{purchaseData.monthlyPayment.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">First Payment:</span><span className="font-semibold">{new Date(purchaseData.firstPaymentDate).toLocaleDateString('en-NG')}</span></div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs space-y-1">
              <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />Delivery after 50% payments</p>
              <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />Auto-debit monthly</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => router.push('/dashboard')} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Dashboard
              </button>
              <button onClick={() => { setStep('browse'); setCart([]); }} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Shop More
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}