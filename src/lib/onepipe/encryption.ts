// lib/onepipe/encryption.ts
import crypto from 'crypto';

/**
 * Encrypt data using TripleDES algorithm
 * Used for auth.secure field in OnePipe requests
 * @param plainText - Text to encrypt
 * @param APP_SECRET - Your OnePipe app secret
 * @returns Base64 encoded encrypted string
 */
export function encryptTripleDES(plainText: string, APP_SECRET: string): string {
  const bufferedKey = Buffer.from(APP_SECRET, 'utf16le');
  const key = crypto.createHash('md5').update(bufferedKey).digest();
  const newKey = Buffer.concat([key, key.slice(0, 8)]);
  const IV = Buffer.alloc(8, '\0');
  const cipher = crypto.createCipheriv('des-ede3-cbc', newKey, IV).setAutoPadding(true);
  return cipher.update(plainText, 'utf8', 'base64') + cipher.final('base64');
}

/**
 * Generate MD5 signature for request headers
 * Used for Signature header in OnePipe requests
 * @param requestRef - Unique request reference
 * @param APP_SECRET - Your OnePipe app secret
 * @returns MD5 hash in hex format
 */
export function generateSignature(requestRef: string, APP_SECRET: string): string {
  const payload = `${requestRef};${APP_SECRET}`;
  return crypto.createHash('md5').update(payload).digest('hex');
}

/**
 * Verify webhook signature
 * Used to validate incoming webhooks from OnePipe
 * @param requestRef - Request reference from webhook
 * @param receivedSignature - Signature from webhook headers
 * @param APP_SECRET - Your OnePipe app secret
 * @returns True if signature is valid
 */
export function verifyWebhookSignature(
  requestRef: string,
  receivedSignature: string,
  APP_SECRET: string
): boolean {
  const expectedSignature = generateSignature(requestRef, APP_SECRET);
  return expectedSignature === receivedSignature;
}

/**
 * Encrypt bank account details for OnePipe
 * Format: {accountNumber};{bankCode}
 * @param accountNumber - 10-digit account number
 * @param bankCode - CBN bank code
 * @param APP_SECRET - Your OnePipe app secret
 * @returns Encrypted string
 */
export function encryptBankAccount(
  accountNumber: string,
  bankCode: string,
  APP_SECRET: string
): string {
  const plainText = `${accountNumber};${bankCode}`;
  return encryptTripleDES(plainText, APP_SECRET);
}

/**
 * Encrypt BVN for OnePipe
 * @param bvn - 11-digit BVN
 * @param APP_SECRET - Your OnePipe app secret
 * @returns Encrypted string
 */
export function encryptBVN(bvn: string, APP_SECRET: string): string {
  return encryptTripleDES(bvn, APP_SECRET);
}