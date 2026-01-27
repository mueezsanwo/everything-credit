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