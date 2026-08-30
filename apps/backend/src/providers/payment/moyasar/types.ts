export type MoyasarProviderOptions = {
  publishableKey?: string
  secretKey?: string
  webhookSecret?: string
  callbackUrl?: string
  apiBaseUrl?: string
}

export type MoyasarSourceType = "creditcard" | "applepay" | "stcpay"
export type MoyasarSourceSelection = "mada" | "visa_mastercard" | "card" | "applepay" | "stcpay"
export type MoyasarStatus = "initiated" | "paid" | "authorized" | "failed" | "expired" | "canceled" | "refunded"

export type MoyasarSource = {
  type: MoyasarSourceType
  company?: string | null
  name?: string | null
  number?: string | null
  gateway_id?: string | null
  token?: string | null
  transaction_url?: string | null
  message?: string | null
}

export type MoyasarPayment = {
  id: string
  status: MoyasarStatus | string
  amount: number
  currency: string
  description?: string | null
  callback_url?: string | null
  refunded?: number | null
  metadata?: Record<string, unknown>
  source?: MoyasarSource | null
  invoice_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type CreateMoyasarPaymentInput = {
  amount: number
  currency: string
  callback_url: string
  description?: string
  metadata?: Record<string, unknown>
  source: {
    type: MoyasarSourceType
    company?: string
    name?: string
    number?: string
    month?: string
    year?: string
    cvc?: string
    mobile?: string
    token?: string
  }
}

export type CreateMoyasarRefundInput = {
  amount: number
  reason?: string
}

export type MoyasarRefund = {
  id: string
  payment_id?: string
  amount?: number
  status?: string
  created_at?: string
}

export type ProviderSessionData = Record<string, unknown> & {
  id?: string
  session_id?: string
  payment_source_selection?: string
  card_name?: string
  card_number?: string
  card_month?: string
  card_year?: string
  card_cvc?: string
  stcpay_mobile?: string
  applepay_token?: string
}
