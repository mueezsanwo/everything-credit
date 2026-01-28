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