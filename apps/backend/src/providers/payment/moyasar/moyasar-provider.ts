import { AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput, CancelPaymentOutput, CapturePaymentInput, CapturePaymentOutput, DeletePaymentInput, DeletePaymentOutput, GetPaymentStatusInput, GetPaymentStatusOutput, InitiatePaymentInput, InitiatePaymentOutput, Logger, PaymentProviderContext, ProviderWebhookPayload, RefundPaymentInput, RefundPaymentOutput, RetrievePaymentInput, RetrievePaymentOutput, UpdatePaymentInput, UpdatePaymentOutput, WebhookActionResult } from "@medusajs/framework/types"
import { AbstractPaymentProvider, MedusaError, PaymentActions, PaymentSessionStatus } from "@medusajs/framework/utils"
import { MoyasarApiService } from "./moyasar-api-service"
import { MoyasarPayment, MoyasarProviderOptions, MoyasarSourceSelection, MoyasarSourceType, ProviderSessionData } from "./types"

type InjectedDependencies = { logger?: Logger }

const SAR_HALALAS_PER_RIYAL = 100

class MoyasarPaymentProviderService extends AbstractPaymentProvider<MoyasarProviderOptions> {
  static identifier = "moyasar"

  protected logger_: Logger
  protected options_: MoyasarProviderOptions
  protected api_: MoyasarApiService

  static validateOptions(options: Record<string, unknown>): void {
    const apiBaseUrl = options?.apiBaseUrl
    if (apiBaseUrl && typeof apiBaseUrl === "string") {
      if (!apiBaseUrl.startsWith("http://") && !apiBaseUrl.startsWith("https://")) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Moyasar apiBaseUrl must be an absolute URL")
      }
    }
  }

  constructor(container: InjectedDependencies, options: MoyasarProviderOptions) {
    super(container, options)
    this.logger_ = container.logger || ({ error: console.error, warn: console.warn, info: console.info, debug: console.debug } as Logger)
    this.options_ = options || {}
    this.api_ = new MoyasarApiService(this.options_)
  }

  private toHalalas(amount: unknown): number {
    const n = typeof amount === "number" ? amount : Number((amount as any)?.value ?? amount)
    return Math.round(n * SAR_HALALAS_PER_RIYAL)
  }

  private getSourceType(selection?: string): { sourceType: MoyasarSourceType; normalizedSelection: MoyasarSourceSelection } {
    const s = (selection || "card").toLowerCase()

    if (s === "mada") return { sourceType: "creditcard", normalizedSelection: "mada" }
    if (s === "applepay" || s === "apple_pay") return { sourceType: "applepay", normalizedSelection: "applepay" }
    if (s === "stcpay" || s === "stc_pay") return { sourceType: "stcpay", normalizedSelection: "stcpay" }

    return { sourceType: "creditcard", normalizedSelection: "visa_mastercard" }
  }

  private toPaymentSessionStatus(status: string): PaymentSessionStatus {
    const s = status.toLowerCase()

    if (s === "authorized") return PaymentSessionStatus.AUTHORIZED
    if (s === "paid" || s === "captured" || s === "refunded") return PaymentSessionStatus.CAPTURED
    if (s === "failed" || s === "expired") return PaymentSessionStatus.ERROR
    if (s === "canceled") return PaymentSessionStatus.CANCELED

    return PaymentSessionStatus.PENDING
  }

  private toWebhookAction(status: string): PaymentActions {
    const s = status.toLowerCase()

    if (s === "authorized") return PaymentActions.AUTHORIZED
    if (s === "paid" || s === "captured") return PaymentActions.SUCCESSFUL
    if (s === "failed" || s === "expired") return PaymentActions.FAILED
    if (s === "canceled") return PaymentActions.CANCELED

    return PaymentActions.PENDING
  }

  private buildSourcePayload(sessionData: ProviderSessionData, sourceType: MoyasarSourceType, selection: MoyasarSourceSelection) {
    if (sourceType === "creditcard") {
      return {
        type: sourceType,
        company: selection === "mada" ? "mada" : "visa_mastercard",
        name: String(sessionData.card_name || ""),
        number: String(sessionData.card_number || "").replace(/\D/g, ""),
        month: String(sessionData.card_month || "").replace(/\D/g, "").padStart(2, "0").slice(0, 2),
        year: String(sessionData.card_year || "").replace(/\D/g, "").length === 2 ? `20${String(sessionData.card_year).replace(/\D/g, "")}` : String(sessionData.card_year || "").replace(/\D/g, ""),
        cvc: String(sessionData.card_cvc || "").replace(/\D/g, ""),
      }
    }
    
    if (sourceType === "stcpay") {
      return { 
        type: sourceType, 
        mobile: String(sessionData.stcpay_mobile || "")
      }
    }

    return { 
      type: sourceType, 
      token: String(sessionData.applepay_token || "") 
    }
  }

  private buildProviderData(payment: MoyasarPayment, previousData?: Record<string, unknown>, sourceSelection?: string): Record<string, unknown> {
    const prev = (previousData || {}) as ProviderSessionData

    return {
      ...prev,
      id: payment.id,
      moyasar_payment_id: payment.id,
      session_id: prev.session_id || (payment.metadata?.session_id as string) || undefined,
      payment_status: payment.status,
      amount_halala: payment.amount,
      amount_sar: payment.amount / SAR_HALALAS_PER_RIYAL,
      payment_source_selection: sourceSelection || prev.payment_source_selection || "visa_mastercard",
      payment_source_company: payment.source?.company || null,
      // Moyasar returns the 3-D Secure / hosted page URL as source.transaction_url.
      // The storefront expects it as payment_url to redirect the shopper.
      payment_url: payment.source?.transaction_url || prev.payment_url || null,
      callback_url: payment.callback_url || this.options_.callbackUrl || prev.callback_url || null,
      moyasar_publishable_key: this.options_.publishableKey || prev.moyasar_publishable_key || null,
      metadata: payment.metadata || {},
      raw_payment: payment,
    }
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const sessionData = (input.data || {}) as ProviderSessionData
    const { sourceType, normalizedSelection } = this.getSourceType(String(sessionData.payment_source_selection || "card"))

    const payment = await this.api_.createPayment({
      amount: this.toHalalas(input.amount),
      currency: input.currency_code.toUpperCase(),
      callback_url: this.options_.callbackUrl || "",
      description: `Order payment${input.context?.customer ? ` for ${input.context.customer.first_name || ""} ${input.context.customer.last_name || ""}`.trim() : ""}`,
      metadata: { ...(sessionData.metadata as Record<string, unknown>), session_id: sessionData.session_id, payment_source_selection: normalizedSelection },
      source: this.buildSourcePayload(sessionData, sourceType, normalizedSelection),
    })

    return { 
      id: payment.id, 
      status: this.toPaymentSessionStatus(payment.status), 
      data: this.buildProviderData(payment, sessionData, normalizedSelection) 
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const sessionData = (input.data || {}) as ProviderSessionData
    const payment = await this.api_.retrievePayment(String(sessionData.moyasar_payment_id || sessionData.id))

    return { 
      status: this.toPaymentSessionStatus(payment.status),
      data: this.buildProviderData(payment, sessionData) 
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const sessionData = (input.data || {}) as ProviderSessionData
    const payment = await this.api_.retrievePayment(String(sessionData.moyasar_payment_id || sessionData.id))

    return { 
      data: this.buildProviderData(payment, sessionData)
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const sessionData = (input.data || {}) as ProviderSessionData
    const paymentId = String(sessionData.moyasar_payment_id || sessionData.id)
    const refund = await this.api_.refundPayment(paymentId, { amount: this.toHalalas(input.amount), reason: "Medusa refund" })
    const payment = await this.api_.retrievePayment(paymentId)
    
    return {
      data: { 
        ...this.buildProviderData(payment, sessionData),
        refund_id: refund.id,
        refund_status: refund.status || null
      }
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const sessionData = (input.data || {}) as ProviderSessionData
    const paymentId = sessionData.moyasar_payment_id || sessionData.id

    if (!paymentId || typeof paymentId !== "string") {
      return { data: { ...sessionData, payment_status: "canceled" } }
    }
    
    const payment = await this.api_.retrievePayment(paymentId)

    return { 
      data: { 
        ...this.buildProviderData(payment, sessionData),
        payment_status: "canceled", 
        canceled_at: new Date().toISOString() 
      } 
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const sessionData = (input.data || {}) as ProviderSessionData
    const payment = await this.api_.retrievePayment(String(sessionData.moyasar_payment_id || sessionData.id))

    return { 
      data: this.buildProviderData(payment, sessionData) 
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const payment = await this.retrievePayment(input)
    
    return { 
      status: this.toPaymentSessionStatus(String(payment.data?.payment_status || "initiated")), 
      data: payment.data 
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const sessionData = (input.data || {}) as ProviderSessionData

    if (sessionData.card_name || sessionData.card_number || sessionData.card_month || sessionData.card_year || sessionData.card_cvc || sessionData.stcpay_mobile || sessionData.applepay_token) {
      return await this.initiatePayment({ amount: input.amount, currency_code: input.currency_code, data: sessionData, context: input.context })
    }

    const paymentId = sessionData.moyasar_payment_id || sessionData.id
    if (paymentId && typeof paymentId === "string") {
      const current = await this.api_.retrievePayment(paymentId)
      if (current.amount === this.toHalalas(input.amount)) {
        return { 
          status: this.toPaymentSessionStatus(current.status), 
          data: this.buildProviderData(current, sessionData) 
        }
      }
    }

    return await this.initiatePayment({ 
      amount: input.amount, 
      currency_code: input.currency_code, 
      data: sessionData, 
      context: input.context 
    })
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return await this.cancelPayment(input)
  }

  async getWebhookActionAndData(data: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    const payload = data.data as { payment?: MoyasarPayment } & Partial<MoyasarPayment>

    const payment = (payload.payment || payload) as MoyasarPayment
    if (!payment?.id) return { action: PaymentActions.NOT_SUPPORTED }

    const sessionId = payment.metadata?.session_id
    if (!sessionId || typeof sessionId !== "string") return { action: PaymentActions.NOT_SUPPORTED }

    return { 
      action: this.toWebhookAction(payment.status), 
      data: { 
        session_id: sessionId, 
        amount: payment.amount / SAR_HALALAS_PER_RIYAL 
      } 
    }
  }
}

export default MoyasarPaymentProviderService