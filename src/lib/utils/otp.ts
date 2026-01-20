// lib/utils/otp.ts

/**
 * Generate random OTP
 * @param length - Length of OTP (default 6)
 * @returns OTP string
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
}

/**
 * Check if OTP is expired
 * @param expiresAt - Expiration date
 * @returns True if expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Get OTP expiration time (10 minutes from now)
 * @returns Expiration date
 */
export function getOTPExpiration(): Date {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
}