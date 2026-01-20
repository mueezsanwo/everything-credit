// lib/onepipe/client.ts
import { encryptTripleDES, encryptBankAccount, encryptBVN, generateSignature } from './encryption';

const ONEPIPE_BASE_URL = 'https://api.onepipe.io';
const API_KEY = process.env.ONEPIPE_API_KEY!;
const APP_CODE = process.env.ONEPIPE_APP_CODE!;
const APP_SECRET = process.env.ONEPIPE_APP_SECRET!;
const BILLER_CODE = process.env.ONEPIPE_BILLER_CODE!;

interface Customer {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Make request to OnePipe API
 */
async function callOnePipe(payload: any) {
  const signature = generateSignature(payload.request_ref, APP_SECRET);
  
  const response = await fetch(`${ONEPIPE_BASE_URL}/v2/transact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Signature': signature
    },
    body: JSON.stringify(payload)
  });
  
  return response.json();
}

/**
 * 1. BVN Lookup Max - Verify BVN and get personal details
 */
export async function lookupBVN(bvn: string, customer: Customer) {
  const requestRef = 'REQ' + Date.now();
  
  const payload = {
    request_ref: requestRef,
    request_type: 'lookup_bvn_max',
    auth: {
      type: 'bvn',
      secure: encryptBVN(bvn, APP_SECRET),
      auth_provider: 'Bvn',
      route_mode: null
    },
    transaction: {
      mock_mode: 'live',
      transaction_ref: 'TXN' + Date.now(),
      transaction_desc: 'BVN Verification',
      transaction_ref_parent: null,
      amount: 0,
      customer: {
        customer_ref: customer.phone,
        firstname: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        mobile_no: customer.phone
      },
      meta: {
        a_key: 'a_meta_value_1',
        b_key: 'a_meta_value_2'
      },
      details: {
        include_image: false,
        otp_override: false
      }
    }
  };
  
  return callOnePipe(payload);
}

/**
 * Validate BVN OTP (if OnePipe requires OTP)
 */
export async function validateBVNOTP(otp: string, provider: string, originalTransactionRef: string) {
  const requestRef = 'REQ' + Date.now();
  
  const payload = {
    request_ref: requestRef,
    request_type: 'lookup_bvn_max',
    auth: {
      secure: encryptTripleDES(otp, APP_SECRET),
      auth_provider: provider
    },
    transaction: {
      transaction_ref: originalTransactionRef
    }
  };
  
  const response = await fetch(`${ONEPIPE_BASE_URL}/v2/transact/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Signature': generateSignature(requestRef, APP_SECRET)
    },
    body: JSON.stringify(payload)
  });
  
  return response.json();
}

/**
 * 2. Get Bank Statement - Retrieve transaction history
 */
export async function getStatement(
  accountNumber: string,
  bankCode: string,
  startDate: string, // Format: "2024-10-01"
  endDate: string,   // Format: "2025-01-01"
  customer: Customer
) {
  const requestRef = 'REQ' + Date.now();
  
  const payload = {
    request_ref: requestRef,
    request_type: 'get_statement',
    auth: {
      type: 'bank.account',
      secure: encryptBankAccount(accountNumber, bankCode, APP_SECRET),
      auth_provider: 'Demoprovider',
      route_mode: null
    },
    transaction: {
      mock_mode: 'live',
      transaction_ref: 'TXN' + Date.now(),
      transaction_desc: 'Statement Retrieval',
      transaction_ref_parent: null,
      amount: 0,
      customer: {
        customer_ref: customer.phone,
        firstname: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        mobile_no: customer.phone
      },
      meta: {
        a_key: 'a_meta_value_1',
        another_key: 'a_meta_value_2'
      },
      details: {
        start_date: startDate,
        end_date: endDate,
        otp_override: true
      }
    }
  };
  
  return callOnePipe(payload);
}

/**
 * 3. Create Mandate - Tokenize account for direct debit
 */
export async function createMandate(
  accountNumber: string,
  bankCode: string,
  maxAmount: number, // In kobo
  bvn: string,
  customer: Customer,
  consentPDF?: string // Base64 PDF or image
) {
  const requestRef = 'REQ' + Date.now();
  
  const payload = {
    request_ref: requestRef,
    request_type: 'create_mandate',
    auth: {
      type: 'bank.account',
      secure: encryptBankAccount(accountNumber, bankCode, APP_SECRET),
      auth_provider: 'PaywithAccount'
    },
    transaction: {
      mock_mode: 'Inspect', // Change to 'Live' in production
      transaction_ref: 'MND' + Date.now(),
      transaction_desc: 'Creating a mandate',
      transaction_ref_parent: null,
      amount: 0,
      customer: {
        customer_ref: customer.phone, // Must be 13-digit: 2348012345678
        firstname: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        mobile_no: customer.phone
      },
      meta: {
        amount: maxAmount.toString(),
        skip_consent: 'true',
        bvn: encryptBVN(bvn, APP_SECRET),
        biller_code: BILLER_CODE,
        customer_consent: consentPDF || ''
      },
      details: {}
    }
  };
  
  return callOnePipe(payload);
}

/**
 * 4. Disburse - Transfer funds to user's account (Loan payout)
 */
export async function disburse(
  accountNumber: string,
  bankCode: string,
  amount: number, // In kobo
  customer: Customer,
  narration?: string
) {
  const requestRef = 'REQ' + Date.now();
  
  const payload = {
    request_ref: requestRef,
    request_type: 'disburse',
    auth: {
      type: null,
      secure: null,
      auth_provider: 'PaywithAccount',
      route_mode: null
    },
    transaction: {
      mock_mode: 'Inspect', // Change to 'Live' in production
      transaction_ref: 'DSB' + Date.now(),
      transaction_desc: narration || 'Loan Disbursement',
      transaction_ref_parent: null,
      amount: amount,
      customer: {
        customer_ref: customer.phone,
        firstname: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        mobile_no: customer.phone
      },
      meta: {
        biller_code: BILLER_CODE
      },
      details: {
        destination_account: accountNumber,
        destination_bank_code: bankCode
      }
    }
  };
  
  return callOnePipe(payload);
}

/**
 * 5. Collect - Debit user's account (Payment collection)
 */
export async function collect(
  mandateToken: string, // Encrypted token from mandate creation
  amount: number, // In kobo
  customer: Customer,
  narration: string
) {
  const requestRef = 'REQ' + Date.now();
  
  const payload = {
    request_ref: requestRef,
    request_type: 'collect',
    auth: {
      type: 'bank.account',
      secure: mandateToken,
      auth_provider: 'PaywithAccount'
    },
    transaction: {
      mock_mode: 'Live',
      transaction_ref: 'COL' + Date.now(),
      transaction_desc: narration,
      transaction_ref_parent: null,
      amount: amount,
      customer: {
        customer_ref: customer.phone,
        firstname: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        mobile_no: customer.phone
      },
      meta: {
        biller_code: BILLER_CODE,
        skip_consent: 'true',
        customer_consent: ''
      },
      details: {}
    }
  };
  
  return callOnePipe(payload);
}