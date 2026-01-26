// lib/onepipe/encryption.ts
import crypto from "crypto";

/**
 * Encrypt data using TripleDES algorithm (DES-EDE3-CBC)
 * Used for auth.secure field in OnePipe requests
 * @param plainText - Text to encrypt
 * @param APP_SECRET - Your OnePipe app secret
 * @returns Base64 encoded encrypted string
 */
export function encryptTripleDES(
  plainText: string,
  secretKey: string
): string {
    const bufferedKey = Buffer.from(secretKey, 'utf16le');
    const key = crypto.createHash('md5').update(bufferedKey).digest();
    const newKey = Buffer.concat([key, key.slice(0, 8)]);
    const IV = Buffer.alloc(8, '\0');
    const cipher = crypto.createCipheriv('des-ede3-cbc', newKey, IV).setAutoPadding(true);
    return cipher.update(plainText, 'utf8', 'base64') + cipher.final('base64');

}

/**
 * Encrypt bank account details for OnePipe
 * Format: "{accountNumber};{bankCode}"
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
 * Generate MD5 signature for request headers
 * @param requestRef - Unique request reference
 * @param APP_SECRET - Your OnePipe app secret
 */
export function generateSignature(
  requestRef: string,
  APP_SECRET: string
): string {
  const payload = `${requestRef};${APP_SECRET}`;
  return crypto.createHash("md5").update(payload, "utf8").digest("hex");
}

/**
 * Verify webhook signature
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
 * Encrypt BVN for OnePipe
 */
export function encryptBVN(bvn: string, APP_SECRET: string): string {
  return encryptTripleDES(bvn, APP_SECRET);
}
