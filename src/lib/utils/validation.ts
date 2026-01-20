// lib/utils/validation.ts

/**
 * Validate email format
 * @param email - Email address
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Nigerian format)
 * @param phone - Phone number
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
  // Should be 11 digits starting with 0, or 13 digits starting with 234
  const phoneRegex = /^(0\d{10}|234\d{10})$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * Format phone to 13-digit format (234...)
 * @param phone - Phone number (0801234567 or 2348012345678)
 * @returns Formatted phone (2348012345678)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  
  // If starts with 0, replace with 234
  if (cleaned.startsWith('0')) {
    return '234' + cleaned.substring(1);
  }
  
  // If already starts with 234, return as is
  if (cleaned.startsWith('234')) {
    return cleaned;
  }
  
  // Otherwise, add 234
  return '234' + cleaned;
}

/**
 * Validate BVN (11 digits)
 * @param bvn - BVN number
 * @returns True if valid
 */
export function isValidBVN(bvn: string): boolean {
  return /^\d{11}$/.test(bvn);
}

/**
 * Validate account number (10 digits)
 * @param accountNumber - Account number
 * @returns True if valid
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  return /^\d{10}$/.test(accountNumber);
}

/**
 * Validate password strength
 * @param password - Password
 * @returns Object with isValid and message
 */
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: 'Password is strong' };
}

/**
 * Mask BVN (show only first 3 and last 4 digits)
 * @param bvn - BVN number
 * @returns Masked BVN (221****5678)
 */
export function maskBVN(bvn: string): string {
  if (bvn.length !== 11) return bvn;
  return bvn.substring(0, 3) + '****' + bvn.substring(7);
}

/**
 * Mask account number (show only last 2 digits)
 * @param accountNumber - Account number
 * @returns Masked account (01234****89)
 */
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length !== 10) return accountNumber;
  return accountNumber.substring(0, 5) + '****' + accountNumber.substring(8);
}