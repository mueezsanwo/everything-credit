export interface SignUpData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  companyName: string;
  occupation: string;
  workEmail?: string;
  monthlySalary: number;
  bankName: string;
  accountNumber: string;
  isSalaryAccount: boolean;
  agreedToTerms: boolean;
  dob: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "user";
  status: "pending_bvn_verification" | string;
  phoneVerified: boolean;
  bvnVerified: boolean;
  hasAccessedCredit: boolean;
  creditLimit: number;
  availableCredit: number;
  token: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: LoginUser;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  userId: string;
  nextStep: "bvn_verification" | string;
}



export interface CalculateCreditData {
  email: string;
}

export interface CalculateCreditResponse {
  message: string;
  creditLimit: number;
  availableCredit: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  inStock: boolean;
}

export interface GetShopProductsResponse {
  success: boolean;
  products: Product[];
}

export interface GetUserProfileResponse {
  success: boolean;
  data: {
    _id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    companyName: string;
    occupation: string;
    workEmail: string;
    monthlySalary: number;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    hasAccessedCredit: boolean;
    creditLimit: number;
    availableCredit: number;
    hasMandateCreated: boolean;
    mandateStatus: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    bvnVerified: boolean;
    status: string;
    dob: string;
    createdAt: string;
    updatedAt: string;
    lastLogin: string;
    bvn: string;
    bvnTransactionRef: number;
    maxSingleDebit: number;
    verifiedSalary: number;
    mandateRef: string;
    mandateActivatedAt: string;
    mandateSubscription_id: number;
  };
}


export interface CartItem {
  productId: number;
  quantity: number;
}

export interface CheckoutData {
  installmentPeriod: number;
  deliveryAddress: string;
  cartItems: CartItem[];
}

export interface PurchaseItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  purchase: {
    purchaseId: string;
    totalRepayment: number;
    monthlyPayment: number;
    installments: number;
    firstPaymentDate: string;
    items: PurchaseItem[];
  };
}

export interface UserPurchase {
  purchaseId: string;
  totalRepayment: number;
  installments: number;
  monthlyPayment: number;
  totalPaid: number;
  totalOutstanding: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  availableCredit: number;
  purchases: UserPurchase[];
}

export interface GetAdminUsersResponse {
  success: boolean;
  users: AdminUser[];
}

// Add these interfaces to your existing interface.ts file

export interface PaymentSchedule {
  _id: string;
  paymentNumber: number;
  dueDate: string;
  amount: number;
  status: string;
  retryCount: number;
  transactionRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface UserPurchaseDetails {
  _id: string;
  purchaseId: string;
  userId: string;
  type: string;
  items: PurchaseItem[];
  subtotal: number;
  fee: number;
  totalRepayment: number;
  monthlyPayment: number;
  installments: number;
  deliveryStatus: string;
  deliveryAddress: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  payments: PaymentSchedule[];
  totalPaid: number;
  remainingBalance: number;
}

export interface AdminUserDetails {
  _id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  companyName: string;
  occupation: string;
  workEmail: string;
  monthlySalary: number;
  bankName: string;
  accountNumber: string;
  hasAccessedCredit: boolean;
  creditLimit: number;
  availableCredit: number;
  hasMandateCreated: boolean;
  mandateStatus: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  bvnVerified: boolean;
  status: string;
  dob: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

export interface GetAdminUserDetailsResponse {
  success: boolean;
  user: AdminUserDetails;
  purchases: UserPurchaseDetails[];
}

// 1. Define both shapes
export interface CollectPaymentSuccess {
  success: true;
  message: string;
  transactionRef?: string;   // optional, from your backend
}

export interface CollectPaymentError {
  success?: false;
  error: string;
  message?: string;
  details?: Array<{
    code: string;
    message: string;
  }>;
}

// 2. Union type for the function return
export type CollectPaymentResponse =
  | CollectPaymentSuccess
  | CollectPaymentError;


export interface CancelMandateResponse {
  message: string;
}