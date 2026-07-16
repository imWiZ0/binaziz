import { HttpTypes } from "@medusajs/types"

export type MoyasarSessionData = {
  moyasar_payment_id: string
  payment_status: string
  transaction_id?: string | null
  payment_source_type?: string | null
  payment_url?: string | null
  callback_url?: string | null
  moyasar_publishable_key?: string | null
}

/**
 * Type-guard for detecting whether a payment session belongs to the Moyasar provider.
 */
export function isMoyasarPaymentSession(
  session: HttpTypes.StorePaymentSession | null | undefined
): boolean {
  return session?.provider_id == "pp_moyasar_default" || false
}

/**
 * Extract typed Moyasar session data from Medusa's payment session payload.
 */
export function getMoyasarSessionData(
  session: HttpTypes.StorePaymentSession
): MoyasarSessionData | null {
  if (!isMoyasarPaymentSession(session)) {
    return null
  }

  const data = (session.data || {}) as Record<string, unknown>

  if (!data.moyasar_payment_id || typeof data.moyasar_payment_id !== "string") {
    return null
  }

  return {
    moyasar_payment_id: data.moyasar_payment_id,
    payment_status:
      typeof data.payment_status === "string" ? data.payment_status : "initiated",
    transaction_id:
      typeof data.transaction_id === "string" ? data.transaction_id : null,
    payment_source_type:
      typeof data.payment_source_type === "string" ? data.payment_source_type : null,
    payment_url: typeof data.payment_url === "string" ? data.payment_url : null,
    callback_url: typeof data.callback_url === "string" ? data.callback_url : null,
    moyasar_publishable_key:
      typeof data.moyasar_publishable_key === "string"
        ? data.moyasar_publishable_key
        : null,
  }
}

/**
 * Redirect the shopper to Moyasar's hosted payment page.
 */
export function redirectToMoyasarHostedPage(data: MoyasarSessionData) {
  if (!data.payment_url) {
    throw new Error("Moyasar payment URL is missing from payment session data")
  }

  window.location.assign(data.payment_url)
}

/**
 * Example integration point for checkout flow:
 * call this right after selecting the Moyasar payment session.
 */
export function handleMoyasarCheckoutRedirect(
  session: HttpTypes.StorePaymentSession | null | undefined
) {
  if (!session) {
    return
  }

  const data = getMoyasarSessionData(session)

  if (!data) {
    return
  }

  if (data.payment_status === "initiated" && data.payment_url) {
    redirectToMoyasarHostedPage(data)
  }
}
