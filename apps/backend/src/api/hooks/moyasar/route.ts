import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ProviderWebhookPayload, WebhookActionResult } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, PaymentActions } from "@medusajs/framework/utils"
import { processPaymentWorkflow } from "@medusajs/medusa/core-flows"
import crypto from "crypto"

type PaymentModuleService = {
  getWebhookActionAndData: ( payload: ProviderWebhookPayload ) => Promise<WebhookActionResult>
}

type QueryService = {
  graph: (input: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
  }) => Promise<{ data: any[] }>
}

const SIGNATURE_HEADERS = [
  "x-moyasar-signature",
  "moyasar-signature",
  "x-signature",
]

function getSignature(headers: MedusaRequest["headers"]): string | undefined {
  for (const headerName of SIGNATURE_HEADERS) {
    const value = headers[headerName]

    if (typeof value === "string" && value.length) {
      return value
    }

    if (Array.isArray(value) && value.length && typeof value[0] === "string") {
      return value[0]
    }
  }

  return undefined
}

function normalizeSignature(signature: string): string {
  return signature.replace(/^sha256=/i, "")
}

function verifySignature(req: MedusaRequest, secret?: string) {
  if (!secret) {
    console.warn("[MOYASAR] No webhook secret configured, skipping signature verification")
    return
  }

  const providedSignature = getSignature(req.headers)

  if (!providedSignature) {
    throw new Error("Missing Moyasar webhook signature")
  }

  const raw =
    typeof req.rawBody === "string"
      ? req.rawBody
      : Buffer.isBuffer(req.rawBody)
      ? req.rawBody.toString("utf8")
      : JSON.stringify(req.body || {})

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(raw)
    .digest("hex")

  const normalizedProvidedSignature = normalizeSignature(providedSignature)

  const expectedBuffer = Buffer.from(expectedSignature)
  const providedBuffer = Buffer.from(normalizedProvidedSignature)

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    throw new Error("Invalid Moyasar webhook signature")
  }
}

// POST: Handle webhooks from Moyasar (server-to-server)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    console.log("[MOYASAR] Webhook received")

    // Temporarily disable signature verification for testing purposes
    // verifySignature(req, process.env.MOYASAR_WEBHOOK_SECRET)

    const paymentModuleService = req.scope.resolve( Modules.PAYMENT ) as PaymentModuleService

    const actionAndData = await paymentModuleService.getWebhookActionAndData({
      provider: "moyasar_default",
      payload: {
        data: (req.body || {}) as Record<string, unknown>,
        rawData: req.rawBody,
        headers: req.headers,
      },
    })

    console.log("[MOYASAR] Webhook action:", actionAndData.action)

    if (actionAndData.action === PaymentActions.NOT_SUPPORTED) {
      console.warn("[MOYASAR] Payment action not supported")
      return res.status(202).json({
        received: true,
        ignored: true,
      })
    }

    console.log("[MOYASAR] Processing payment workflow...")
    await processPaymentWorkflow(req.scope).run({
      input: actionAndData,
    })

    console.log("[MOYASAR] Webhook processed successfully")
    return res.status(200).json({
      received: true,
      action: actionAndData.action,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    console.error("[MOYASAR] Webhook error:", error)

    return res.status(400).json({
      received: false,
      message,
    })
  }
}

// GET: Handle browser redirect from Moyasar after payment
// Moyasar redirects users to the callback_url with query parameters like ?status=paid
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { status, id, ...rest } = req.query as Record<string, string>

  console.log("[MOYASAR] Browser redirect received with status:", status, "id:", id)

  // Build query string from all parameters
  const queryParams = new URLSearchParams({ status, ...rest })
  if (id) {
    queryParams.set("id", id)
  }

  // If payment was successful, try to find the cart_id from Moyasar payment metadata
  if (["paid", "authorized", "captured"].includes(String(status || "").toLowerCase()) && id) {
    try {
      // Approach 1: Retrieve the payment from Moyasar API and get cart_id from metadata
      const moyasarProvider = req.scope.resolve("pp_moyasar_default") as any

      if (moyasarProvider && typeof moyasarProvider.retrievePayment === "function") {
        const paymentResult = await moyasarProvider.retrievePayment({ data: { id } })
        const paymentData = paymentResult?.data as Record<string, unknown> | undefined
        const metadata = paymentData?.metadata as Record<string, unknown> | undefined
        const cartId = metadata?.cart_id as string | undefined

        if (cartId) {
          console.log("[MOYASAR] Found cart_id from Moyasar metadata:", cartId)
          queryParams.set("cart_id", cartId)
        } else {
          console.warn("[MOYASAR] No cart_id in Moyasar payment metadata, trying DB lookup")
          // Approach 2: Fall back to DB lookup
          const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as QueryService

          // Find the payment session by moyasar_payment_id in its data
          const { data: paymentSessions } = await query.graph({
            entity: "payment_session",
            fields: ["id", "data", "payment_collection_id"],
          })

          const session = paymentSessions.find((s: any) => {
            const sessionData = s.data as Record<string, unknown> | null
            return sessionData?.moyasar_payment_id === id || sessionData?.id === id
          })

          if (session) {
            console.log("[MOYASAR] Found payment session:", session.id)

            // Find the payment collection to get the cart
            const { data: paymentCollections } = await query.graph({
              entity: "payment_collection",
              fields: ["id", "cart_id"],
              filters: { id: session.payment_collection_id },
            })

            const cartId = paymentCollections[0]?.cart_id

            if (cartId) {
              console.log("[MOYASAR] Found cart from DB:", cartId)
              queryParams.set("cart_id", cartId)
            }
          } else {
            console.warn("[MOYASAR] No payment session found for Moyasar payment ID:", id)
          }
        }
      }
    } catch (error) {
      console.error("[MOYASAR] Error looking up cart from payment:", error)
    }
  }

  // Redirect browser to the storefront checkout page
  return res.redirect(302, `http://localhost:8000/checkout?${queryParams.toString()}`)
}
