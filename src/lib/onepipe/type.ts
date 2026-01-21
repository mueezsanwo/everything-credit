// lib/onepipe/types.ts

export interface OnePipeCustomer {
  customer_ref: string;
  firstname: string;
  surname: string;
  email: string;
  mobile_no: string;
}

export interface OnePipeAuth {
  type: string | null;
  secure: string | null;
  auth_provider: string;
  route_mode?: string | null;
}

export interface OnePipeTransaction {
  mock_mode: 'live' | 'Inspect';
  transaction_ref: string;
  transaction_desc: string;
  transaction_ref_parent?: string | null;
  amount: number;
  customer: OnePipeCustomer;
  meta?: Record<string, any>;
  details?: Record<string, any>;
}

export interface OnePipeRequest {
  request_ref: string;
  request_type: string;
  auth: OnePipeAuth;
  transaction: OnePipeTransaction;
}

export interface OnePipeResponse {
  status: string;
  message: string;
  data: {
    provider_response_code: string;
    provider: string;
    errors: any;
    error: any;
    provider_response: any;
    client_info?: any;
  };
}

export interface BVNData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  phone_number: string;
  bvn: string;
  image?: string;
}

export interface StatementTransaction {
  transaction_reference: string;
  transaction_amount: number;
  balance: number;
  transaction_type: 'C' | 'D'; // C = Credit, D = Debit
  transaction_date: string;
  description: string;
}

export interface StatementResponse {
  closing_balance: number;
  opening_balance: number;
  statement_list: StatementTransaction[];
  reference: string;
  meta?: Record<string, any>;
}

export interface MandateResponse {
  reference: string;
  account_number: string;
  contract_code?: string;
  account_reference: string;
  account_name?: string;
  currency_code: string;
  customer_email: string;
  bank_name?: string;
  bank_code: string;
  account_type?: string;
  status: string;
  created_on: string;
  provider_auth_token?: string;
  meta?: {
    subscription_id: number;
    existing_subscription: boolean;
  };
}

export interface DisburseResponse {
  reference: string;
  payment_id: string;
  destination_institution_code: string;
  beneficiary_account_name: string;
  beneficiary_account_number: string;
  beneficiary_kyc_level: string;
  originator_account_name: string;
  originator_account_number: string;
  originator_kyc_level: string;
  narration: string;
  transaction_final_amount: number;
  meta?: Record<string, any>;
}

export interface CollectResponse {
  provider_auth_token: string;
  paymentoptions: any[];
  transaction_final_amount: number;
  reference: string;
  meta?: {
    session_id?: string;
    start_date?: string;
    end_date?: string;
    expected_transaction_count?: number;
    successful_transaction_count?: number;
    failed_transaction_count?: number;
    subscription_id?: number;
  };
}

export interface WebhookPayload {
  request_ref: string;
  request_type: string;
  requester: string;
  mock_mode: string;
  details: {
    amount: number;
    transaction_type: string;
    transaction_ref: string;
    status: string;
    provider: string;
    customer_ref: string;
    customer_email: string;
    customer_firstname: string;
    customer_surname: string;
    customer_mobile_no: string;
    data?: any;
    meta?: {
      event_type?: string;
      payment_id?: string;
      account_no?: string;
      subscription_id?: string;
      [key: string]: any;
    };
  };
  app_info: {
    app_code: string;
  };
}