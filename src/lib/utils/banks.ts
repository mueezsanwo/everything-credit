// lib/utils/banks.ts

export const BANK_CODES: { [key: string]: string } = {
  // Existing banks
  'Access Bank': '044',
  'GTBank': '058',
  'First Bank': '011',
  'UBA': '033',
  'Zenith Bank': '057',
  'Kuda Bank': '981',
  'Wema Bank': '035',
  'Fidelity Bank': '070',
  'Polaris Bank': '076',
  'Sterling Bank': '232',
  'Union Bank': '032',
  'Unity Bank': '215',
  'FCMB': '214',
  'Stanbic IBTC': '221',
  'Ecobank': '050',
  'Keystone Bank': '082',
  'Jaiz Bank': '301',
  'Providus Bank': '101',
  'SunTrust Bank': '100',
  'First City Monument Bank': '214', // FCMB full name
  'Parallex Bank': '104',
  'TAJ Bank': '302',
  'TCF MFB': '51211',
  'United Bank For Africa': '033', // UBA full name
};


/**
 * Get bank code from bank name
 * @param bankName - Name of the bank
 * @returns CBN bank code or empty string
 */
export function getBankCode(bankName: string): string {
  return BANK_CODES[bankName] || '';
}

/**
 * Get bank name from bank code
 * @param bankCode - CBN bank code
 * @returns Bank name or empty string
 */
export function getBankName(bankCode: string): string {
  const entry = Object.entries(BANK_CODES).find(([_, code]) => code === bankCode);
  return entry ? entry[0] : '';
}

/**
 * Get all banks as array
 * @returns Array of { name, code }
 */
export function getAllBanks() {
  return Object.entries(BANK_CODES).map(([name, code]) => ({ name, code }));
}