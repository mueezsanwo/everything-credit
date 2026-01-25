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
  APP_SECRET: string
): string {
  // Correct: use UTF-8, not UTF-16LE
  const key = crypto.createHash("md5").update(APP_SECRET, "utf8").digest(); // 16 bytes
  const fullKey = Buffer.concat([key, key.slice(0, 8)]); // 24 bytes for 3DES
  const iv = Buffer.alloc(8, 0); // 8-byte zero IV

  const cipher = crypto.createCipheriv("des-ede3-cbc", fullKey, iv);
  cipher.setAutoPadding(true);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  console.log({ encrypted: encrypted.toString("base64") });
  return encrypted.toString("base64");
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
  console.log({ payload });
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
