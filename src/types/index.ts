// types/index.ts

import { Types } from 'mongoose';

// User Types
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  companyName?: string;
  occupation?: string;
  workEmail?: string;
  monthlySalary?: number;
  bvn?: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  hasAccessedCredit: boolean;
  creditLimit: number;
  availableCredit: number;
  verifiedSalary?: number;
  maxSingleDebit?: number;
  hasMandateCreated: boolean;
  mandateRef?: string;
  mandateToken?: string;
  mandateStatus: 'pending' | 'active' | 'expired';
  mandateActivatedAt?: Date;
  phoneVerified: boolean;
  emailVerified: boolean;
  bvnVerified: boolean;
  status: 'pending_phone_verification' | 'pending_bvn_verification' | 'verified' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Loan Types
export interface ILoan {
  _id: Types.ObjectId;
  loanId: string;
  userId: Types.ObjectId;
  type: string;
  name: string;
  amount: number;
  fee: number;
  totalRepayment: number;
  monthlyPayment: number;
  installments: number;
  transactionRef?: string;
  purpose?: string;
  status: 'pending' | 'active' | 'completed' | 'defaulted';
  disbursedAt?: Date;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Purchase Types
export interface IPurchaseItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IPurchase {
  _id: Types.ObjectId;
  purchaseId: string;
  userId: Types.ObjectId;
  type: string;
  items: IPurchaseItem[];
  subtotal: number;
  fee: number;
  totalRepayment: number;
  monthlyPayment: number;
  installments: number;
  deliveryStatus: 'pending_payment' | 'in_transit' | 'delivered';
  deliveryAddress?: string;
  deliveredAt?: Date;
  status: 'pending' | 'active' | 'completed' | 'defaulted';
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface IPayment {
  _id: Types.ObjectId;
  loanId?: Types.ObjectId;
  purchaseId?: Types.ObjectId;
  userId: Types.ObjectId;
  paymentNumber: number;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  paidDate?: Date;
  transactionRef?: string;
  failureReason?: string;
  retryCount: number;
  lastRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// OTP Types
export interface IOTP {
  _id: Types.ObjectId;
  phone: string;
  email?: string;
  otp: string;
  type: 'phone' | 'email' | 'bvn';
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Webhook Types
export interface IWebhook {
  _id: Types.ObjectId;
  requestRef?: string;
  requestType?: string;
  provider?: string;
  transactionRef?: string;
  transactionType?: string;
  status?: string;
  amount?: number;
  customerRef?: string;
  payload: any;
  processed: boolean;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

// Product Types (for shop)
export interface IProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  category: 'tv' | 'appliances' | 'kitchen' | 'electronics';
  brand: string;
  inStock: boolean;
}

// Cart Item Types
export interface ICartItem {
  product: IProduct;
  quantity: number;
}

// Credit Status Types
export interface ICreditStatus {
  hasAccessedCredit: boolean;
  creditLimit: number;
  availableCredit: number;
  verifiedSalary?: number;
  maxSingleDebit?: number;
  activeLoansCount: number;
  activePurchasesCount: number;
  totalLoanAmount: number;
  totalPurchaseMonthly: number;
  mandateStatus: string;
  hasMandateCreated: boolean;
}