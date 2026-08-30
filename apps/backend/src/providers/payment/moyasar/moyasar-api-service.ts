import { MedusaError } from "@medusajs/framework/utils"
import { CreateMoyasarPaymentInput, CreateMoyasarRefundInput, MoyasarPayment, MoyasarRefund, MoyasarProviderOptions } from "./types"

const DEFAULT_MOYASAR_API_BASE_URL = "https://api.moyasar.com/v1"

export class MoyasarApiService {
  private readonly baseUrl_: string
  private readonly secretKey_: string

  constructor(options: MoyasarProviderOptions) {
    this.baseUrl_ = options.apiBaseUrl || DEFAULT_MOYASAR_API_BASE_URL
    this.secretKey_ = options.secretKey || ""
  }

  private getAuthorizationHeader(): string {
    if (!this.secretKey_) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "MOYASAR_SECRET_KEY is not configured")
    }

    const token = Buffer.from(`${this.secretKey_}:`).toString("base64")
    return `Basic ${token}`
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl_}${path}`, {...init, headers: {Authorization: this.getAuthorizationHeader(), "Content-Type": "application/json", ...(init.headers || {})}})

    if (!response.ok) {
      let errorMessage = `Moyasar API request failed with status ${response.status}`

      try {
        const payload = (await response.json()) as {
          message?: string
          errors?: Record<string, string[]>
        }

        if (payload?.message) {
          errorMessage = payload.message
        }

        if (payload?.errors && typeof payload.errors === "object") {
          const details = Object.entries(payload.errors).map(([field, messages]) => `${field}: ${(messages || []).join(", ")}`).join("; ")

          if (details) {
            errorMessage = `${errorMessage} (${details})`
          }
        }
      } catch {
        // Ignore body parse errors and return generic status-based message.
      }

      throw new MedusaError(MedusaError.Types.INVALID_DATA, errorMessage)
    }

    return (await response.json()) as T
  }

  async createPayment(input: CreateMoyasarPaymentInput): Promise<MoyasarPayment> {
    return await this.request<MoyasarPayment>("/payments", {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  async retrievePayment(paymentId: string): Promise<MoyasarPayment> {
    return await this.request<MoyasarPayment>(`/payments/${paymentId}`, {
      method: "GET",
    })
  }

  async refundPayment(paymentId: string, input: CreateMoyasarRefundInput): Promise<MoyasarRefund> {
    return await this.request<MoyasarRefund>(`/payments/${paymentId}/refunds`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }
}
