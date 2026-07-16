import { AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput, CancelPaymentOutput, CapturePaymentInput, CapturePaymentOutput, DeletePaymentInput, DeletePaymentOutput, GetPaymentStatusInput, GetPaymentStatusOutput, InitiatePaymentInput, InitiatePaymentOutput, Logger, PaymentProviderContext, ProviderWebhookPayload, RefundPaymentInput, RefundPaymentOutput, RetrievePaymentInput, RetrievePaymentOutput, UpdatePaymentInput, UpdatePaymentOutput, WebhookActionResult } from "@medusajs/framework/types"
import { AbstractPaymentProvider, MedusaError, PaymentActions, PaymentSessionStatus } from "@medusajs/framework/utils"
import { MoyasarApiService } from "./moyasar-api-service"
import { MoyasarPayment, MoyasarProviderOptions, MoyasarSourceSelection, MoyasarSourceType } from "./types"

type InjectedDependencies = { logger?: Logger }

type ProviderSessionData = Record<string, unknown> & {
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

const SAR_HALALAS_PER_RIYAL = 100

console.log("MOYASAR PROVIDER FILE LOADED")

class MoyasarPaymentProviderService extends AbstractPaymentProvider<MoyasarProviderOptions> {
  static identifier = "moyasar"

  protected logger_: Logger
  protected options_: MoyasarProviderOptions
  protected api_: MoyasarApiService

  static validateOptions(options: Record<string, unknown>): void {
    const apiBaseUrl = options?.apiBaseUrl

    if (apiBaseUrl && typeof apiBaseUrl === "string") {
      if (!apiBaseUrl.startsWith("http://") && !apiBaseUrl.startsWith("https://")) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Moyasar apiBaseUrl must be an absolute URL"
        )
      }
    }
  }

  constructor(container: InjectedDependencies, options: MoyasarProviderOptions) {
    super(container, options)
    
    console.log("MOYASAR PROVIDER CONSTRUCTED")

    this.logger_ =
      container.logger ||
      ({
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug,
      } as Logger)

    this.options_ = options || {}
    this.api_ = new MoyasarApiService(this.options_)
  }

  private parseAmount(amount: unknown): number {
    if (typeof amount === "number") {
      return amount
    }

    if (typeof amount === "string") {
      const parsed = Number(amount)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }

    if (amount && typeof amount === "object" && "value" in (amount as Record<string, unknown>)) {
      const parsed = Number((amount as Record<string, unknown>).value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }

    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid payment amount: ${String(amount)}`
    )
  }

  private toHalalas(amount: unknown, currencyCode: string): number {
    if (currencyCode.toLowerCase() !== "sar") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Moyasar provider currently supports SAR only"
      )
    }

    const amountAsNumber = this.parseAmount(amount)
    return Math.round(amountAsNumber * SAR_HALALAS_PER_RIYAL)
  }

  private fromHalalas(amount: number): number {
    return amount / SAR_HALALAS_PER_RIYAL
  }

  private getSourceType(selection?: string): {
    sourceType: MoyasarSourceType
    normalizedSelection: MoyasarSourceSelection
  } {
    const normalized = (selection || "card").toLowerCase()

    switch (normalized) {
      case "mada":
        return { sourceType: "creditcard", normalizedSelection: "mada" }
      case "visa":
      case "mastercard":
      case "visa_mastercard":
      case "card":
      case "creditcard":
        return { sourceType: "creditcard", normalizedSelection: "visa_mastercard" }
      case "applepay":
      case "apple_pay":
        return { sourceType: "applepay", normalizedSelection: "applepay" }
      case "stcpay":
      case "stc_pay":
        return { sourceType: "stcpay", normalizedSelection: "stcpay" }
      default:
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Unsupported Moyasar payment source selection: ${selection}`
        )
    }
  }

  private toPaymentSessionStatus(status: string): PaymentSessionStatus {
    switch (status.toLowerCase()) {
      case "authorized":
        return PaymentSessionStatus.AUTHORIZED
      case "paid":
      case "captured":
      case "refunded":
        return PaymentSessionStatus.CAPTURED
      case "failed":
      case "expired":
        return PaymentSessionStatus.ERROR
      case "canceled":
        return PaymentSessionStatus.CANCELED
      case "initiated":
      default:
        return PaymentSessionStatus.PENDING
    }
  }

  private toWebhookAction(status: string): PaymentActions {
    switch (status.toLowerCase()) {
      case "authorized":
        return PaymentActions.AUTHORIZED
      case "paid":
      case "captured":
        return PaymentActions.SUCCESSFUL
      case "failed":
      case "expired":
        return PaymentActions.FAILED
      case "canceled":
        return PaymentActions.CANCELED
      case "initiated":
      default:
        return PaymentActions.PENDING
    }
  }

  private getSessionData(inputData?: Record<string, unknown>): ProviderSessionData {
    return (inputData || {}) as ProviderSessionData
  }

  private getRequiredString(
    sessionData: ProviderSessionData,
    key: keyof ProviderSessionData,
    errorMessage: string
  ): string {
    const value = sessionData[key]

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }

    throw new MedusaError(MedusaError.Types.INVALID_DATA, errorMessage)
  }

  private hasFreshSourceData(sessionData: ProviderSessionData): boolean {
    return Boolean(
      sessionData.card_name ||
        sessionData.card_number ||
        sessionData.card_month ||
        sessionData.card_year ||
        sessionData.card_cvc ||
        sessionData.stcpay_mobile ||
        sessionData.applepay_token
    )
  }

  private normalizeCardMonth(raw: string): string {
    const month = raw.replace(/\D/g, "").slice(0, 2)

    if (!month) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Moyasar card expiry month is required")
    }

    const monthAsNumber = Number(month)

    if (!Number.isInteger(monthAsNumber) || monthAsNumber < 1 || monthAsNumber > 12) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Moyasar card expiry month must be between 1 and 12")
    }

    return String(monthAsNumber).padStart(2, "0")
  }

  private normalizeCardYear(raw: string): string {
    const digits = raw.replace(/\D/g, "")

    if (!digits) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Moyasar card expiry year is required")
    }

    if (digits.length === 2) {
      return `20${digits}`
    }

    if (digits.length === 4) {
      return digits
    }

    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Moyasar card expiry year must be YY or YYYY")
  }

  private normalizeCardNumber(raw: string): string {
    const normalized = raw.replace(/\D/g, "")

    if (normalized.length < 12 || normalized.length > 19) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Moyasar card number is invalid")
    }

    return normalized
  }

  private normalizeCardCvc(raw: string): string {
    const normalized = raw.replace(/\D/g, "")

    if (normalized.length < 3 || normalized.length > 4) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Moyasar card cvc must be 3 or 4 digits")
    }

    return normalized
  }

  private buildSourcePayload(
    sessionData: ProviderSessionData,
    sourceType: MoyasarSourceType,
    selection: MoyasarSourceSelection
  ) {
    if (sourceType === "creditcard") {
      return {
        type: sourceType,
        company: selection === "mada" ? "mada" : "visa_mastercard",
        name: this.getRequiredString(
          sessionData,
          "card_name",
          "Moyasar card holder name is required"
        ),
        number: this.normalizeCardNumber(
          this.getRequiredString(
            sessionData,
            "card_number",
            "Moyasar card number is required"
          )
        ),
        month: this.normalizeCardMonth(
          this.getRequiredString(
            sessionData,
            "card_month",
            "Moyasar card expiry month is required"
          )
        ),
        year: this.normalizeCardYear(
          this.getRequiredString(
            sessionData,
            "card_year",
            "Moyasar card expiry year is required"
          )
        ),
        cvc: this.normalizeCardCvc(
          this.getRequiredString(
            sessionData,
            "card_cvc",
            "Moyasar card cvc is required"
          )
        ),
      }
    }

    if (sourceType === "stcpay") {
      return {
        type: sourceType,
        mobile: this.getRequiredString(
          sessionData,
          "stcpay_mobile",
          "Moyasar stcpay mobile is required"
        ),
      }
    }

    return {
      type: sourceType,
      token: this.getRequiredString(
        sessionData,
        "applepay_token",
        "Moyasar apple pay token is required"
      ),
    }
  }

  private buildProviderData(
    payment: MoyasarPayment,
    previousData?: Record<string, unknown>,
    sourceSelection?: string
  ): Record<string, unknown> {
    const previous = this.getSessionData(previousData)
    const transactionId =
      payment.source?.gateway_id ||
      payment.source?.transaction_url ||
      payment.invoice_id ||
      payment.id

    return {
      ...previous,
      id: payment.id,
      session_id:
        previous.session_id ||
        (payment.metadata?.session_id as string | undefined) ||
        undefined,
      moyasar_payment_id: payment.id,
      payment_status: payment.status,
      transaction_id: transactionId,
      payment_source_type: payment.source?.type || sourceSelection || "creditcard",
      payment_source_company: payment.source?.company || null,
      amount_halala: payment.amount,
      amount_sar: this.fromHalalas(payment.amount),
      refunded_halala: payment.refunded || 0,
      payment_url: payment.source?.transaction_url || null,
      callback_url: payment.callback_url || this.options_.callbackUrl || null,
      moyasar_publishable_key: this.options_.publishableKey || null,
      available_payment_sources: ["mada", "visa_mastercard", "applepay", "stcpay"],
      payment_source_selection:
        sourceSelection ||
        previous.payment_source_selection ||
        "visa_mastercard",
      metadata: payment.metadata || {},
      raw_payment: payment,
    }
  }

  private getDescription(context?: PaymentProviderContext): string {
    const customerName =
      context?.customer?.company_name ||
      [context?.customer?.first_name, context?.customer?.last_name].filter(Boolean).join(" ")

    return customerName ? `Order payment for ${customerName}` : "Order payment"
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const sessionData = this.getSessionData(input.data)
    const { sourceType, normalizedSelection } = this.getSourceType(
      String(sessionData.payment_source_selection || "card")
    )

    if (!this.options_.callbackUrl) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "MOYASAR_CALLBACK_URL is not configured"
      )
    }

    const amount = this.toHalalas(input.amount, input.currency_code)

    // Extract cart_id from context or session data for later retrieval
    const cartId =
      (input.context as Record<string, unknown>)?.cart_id as string | undefined ||
      (sessionData.metadata as Record<string, unknown> | undefined)?.cart_id as string | undefined

    const payment = await this.api_.createPayment({
      amount,
      currency: input.currency_code.toUpperCase(),
      callback_url: this.options_.callbackUrl,
      description: this.getDescription(input.context),
      metadata: {
        ...(sessionData.metadata as Record<string, unknown> | undefined),
        session_id: sessionData.session_id,
        payment_source_selection: normalizedSelection,
        cart_id: cartId,
      },
      source: this.buildSourcePayload(sessionData, sourceType, normalizedSelection),
    })

    return {
      id: payment.id,
      status: this.toPaymentSessionStatus(payment.status),
      data: this.buildProviderData(payment, sessionData, normalizedSelection),
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const sessionData = this.getSessionData(input.data)
    const paymentId = sessionData.moyasar_payment_id || sessionData.id

    if (!paymentId || typeof paymentId !== "string") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing moyasar_payment_id while authorizing payment"
      )
    }

    const payment = await this.api_.retrievePayment(paymentId)

    return {
      status: this.toPaymentSessionStatus(payment.status),
      data: this.buildProviderData(payment, sessionData),
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const sessionData = this.getSessionData(input.data)
    const paymentId = sessionData.moyasar_payment_id || sessionData.id

    if (!paymentId || typeof paymentId !== "string") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing moyasar_payment_id while capturing payment"
      )
    }

    // Moyasar handles capture based on its payment flow. We retrieve the current
    // state and persist it into Medusa's payment data.
    const payment = await this.api_.retrievePayment(paymentId)

    return {
      data: this.buildProviderData(payment, sessionData),
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const sessionData = this.getSessionData(input.data)
    const paymentId = sessionData.moyasar_payment_id || sessionData.id

    if (!paymentId || typeof paymentId !== "string") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing moyasar_payment_id while refunding payment"
      )
    }

    const amount = this.toHalalas(input.amount, "sar")

    const refund = await this.api_.refundPayment(paymentId, {
      amount,
      reason: "Medusa refund",
    })

    const payment = await this.api_.retrievePayment(paymentId)

    return {
      data: {
        ...this.buildProviderData(payment, sessionData),
        refund_id: refund.id,
        refund_status: refund.status || null,
      },
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const sessionData = this.getSessionData(input.data)
    const paymentId = sessionData.moyasar_payment_id || sessionData.id

    if (!paymentId || typeof paymentId !== "string") {
      return {
        data: {
          ...sessionData,
          payment_status: "canceled",
        },
      }
    }

    // Moyasar doesn't expose a dedicated cancel endpoint in all flows.
    // We store canceled status in Medusa data and keep the provider reference.
    const payment = await this.api_.retrievePayment(paymentId)

    return {
      data: {
        ...this.buildProviderData(payment, sessionData),
        payment_status: "canceled",
        canceled_at: new Date().toISOString(),
      },
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const sessionData = this.getSessionData(input.data)
    const paymentId = sessionData.moyasar_payment_id || sessionData.id

    if (!paymentId || typeof paymentId !== "string") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing moyasar_payment_id while retrieving payment"
      )
    }

    const payment = await this.api_.retrievePayment(paymentId)

    return {
      data: this.buildProviderData(payment, sessionData),
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const payment = await this.retrievePayment(input)
    const paymentStatus = String(payment.data?.payment_status || "initiated")

    return {
      status: this.toPaymentSessionStatus(paymentStatus),
      data: payment.data,
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const sessionData = this.getSessionData(input.data)

    if (this.hasFreshSourceData(sessionData)) {
      return await this.initiatePayment({
        amount: input.amount,
        currency_code: input.currency_code,
        data: sessionData,
        context: input.context,
      })
    }

    const paymentId = sessionData.moyasar_payment_id || sessionData.id

    if (paymentId && typeof paymentId === "string") {
      const current = await this.api_.retrievePayment(paymentId)

      if (current.amount === this.toHalalas(input.amount, input.currency_code)) {
        return {
          status: this.toPaymentSessionStatus(current.status),
          data: this.buildProviderData(current, sessionData),
        }
      }
    }

    // Amount changed: create a new Moyasar payment and replace provider data.
    return await this.initiatePayment({
      amount: input.amount,
      currency_code: input.currency_code,
      data: sessionData,
      context: input.context,
    })
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return await this.cancelPayment(input)
  }

  async getWebhookActionAndData(
    data: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const payload = data.data as { payment?: MoyasarPayment } & Partial<MoyasarPayment>
    const payment = (payload.payment || payload) as MoyasarPayment

    if (!payment || !payment.id) {
      return {
        action: PaymentActions.NOT_SUPPORTED,
      }
    }

    const sessionId = payment.metadata?.session_id

    if (!sessionId || typeof sessionId !== "string") {
      // We only process events that can be mapped to a Medusa payment session.
      return {
        action: PaymentActions.NOT_SUPPORTED,
      }
    }

    return {
      action: this.toWebhookAction(payment.status),
      data: {
        session_id: sessionId,
        amount: this.fromHalalas(payment.amount),
      },
    }
  }
}

export default MoyasarPaymentProviderService
