// lib/utils/banks.ts

export const BANK_CODES: { [key: string]: string } = {
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
  'Heritage Bank': '030',
  'FCMB': '214',
  'Stanbic IBTC': '221',
  'Ecobank': '050',
  'Keystone Bank': '082',
  'Jaiz Bank': '301',
  'Providus Bank': '101',
  'SunTrust Bank': '100',
  'Moniepoint': '256',
  'PalmPay': '469',
  'OPay': '305'
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