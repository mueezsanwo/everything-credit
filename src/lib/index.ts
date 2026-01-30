import {
  SignUpData,
  SignInData,
  VerifyEmailData,
  VerifyEmailResponse,
  GetShopProductsResponse,
  GetUserProfileResponse,
  CheckoutData,
  GetAdminUsersResponse,
  GetAdminUserDetailsResponse,
  CollectPaymentResponse,
  CancelMandateResponse
} from './interface';
import { apiHandler } from '@/services/api-handler';

export async function signUp(data: SignUpData) {
  return apiHandler('/api/auth/signup', {
    method: 'POST',
    body: data,
  });
}

export async function signIn(data: SignInData) {
  return apiHandler('/api/auth/login', {
    method: 'POST',
    body: data,
  });
}

export async function verifyEmail(data: VerifyEmailData) {
  return apiHandler<VerifyEmailResponse>('/api/auth/verify-email', {
    method: 'POST',
    body: data,
  });
}

export async function resendOTP(email: string) {
  return apiHandler('/api/auth/send-otp', {
    method: 'POST',
    body: { email },
  });
}

export async function calculateCredit(email: string) {
  return apiHandler('/api/user/calculate-credit', {
    method: 'POST',
    body: { email },
  });
}

export async function checkBVN(bvn: string) {
  return apiHandler('/api/user/check-bvn', {
    method: 'POST',
    body: { bvn },
  });
}

export async function validateBVN(otp: string) {
  return apiHandler('/api/user/validate-bvn', {
    method: 'POST',
    body: { otp },
  });
}

export async function createMandate() {
  return apiHandler('/api/user/mandate/create', {
    method: 'POST',
  });
}

export async function saveBVN(bvn: string) {
  return apiHandler('/api/user/bvn', {
    method: 'POST',
    body: { bvn },
  });
}

export async function getShopProducts() {
  return apiHandler('/api/shop/products', {
    method: 'GET',
  }) as Promise<GetShopProductsResponse>;
}

export async function getUserProfile() {
  return apiHandler('/api/user/profile', {
    method: 'GET',
  }) as Promise<GetUserProfileResponse>;
}

export async function checkout(checkoutData: CheckoutData) {
  return apiHandler('/api/shop/checkout', {
    method: 'POST',
    body: checkoutData,
  });
}

export async function getAdminUsers() {
  return apiHandler('/api/admin/users', {
    method: 'GET',
  }) as Promise<GetAdminUsersResponse>;
}

export async function getAdminUserDetails(userId: string) {
  return apiHandler(`/api/admin/users/${userId}`, {
    method: 'GET',
  }) as Promise<GetAdminUserDetailsResponse>;
}



export async function collectPaymentNow(paymentId: string): Promise<CollectPaymentResponse> {
  return apiHandler('/api/payments/collect-now', {
    method: 'POST',
    body: { paymentId },
  }) as Promise<CollectPaymentResponse>;
}

export async function cancelMandate() {
  return apiHandler('/api/user/mandate/cancel', {
    method: 'POST',
  }) as Promise<CancelMandateResponse>;
}