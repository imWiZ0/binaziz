import { sdk } from "@lib/config"
import { getAuthHeaders, getCartId, removeCartId } from "@lib/data/cookies"
import { getBaseURL } from "@lib/util/env"
import { HttpTypes } from "@medusajs/types"
import { NextResponse } from "next/server"

/**
 * Build an absolute redirect URL using the configured public base URL.
 *
 * We intentionally do NOT use `request.url` as the base: behind the nginx
 * reverse proxy the incoming request origin can be `http://localhost:8000`
 * (the internal storefront address), which would leak into the redirect
 * `Location` header and send the shopper to localhost. Using the canonical
 * public base URL guarantees the browser is sent back to the real domain.
 */
function buildRedirectUrl(pathAndQuery: string): URL {
  return new URL(pathAndQuery, getBaseURL())
}

/**
 * Route Handler to complete a cart and create an order.
 * This is used after Moyasar payment redirect when the cart cookie
 * may not be available (cross-site redirect).
 *
 * Query params:
 * - cart_id: The cart ID to complete (from Moyasar payment metadata)
 * - id: The Moyasar payment ID (for reference)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cartId = searchParams.get("cart_id")
  const moyasarId = searchParams.get("id")

  console.log("[COMPLETE-CART] Route handler called", { cartId, moyasarId })

  const id = cartId || (await getCartId())

  if (!id) {
    console.error("[COMPLETE-CART] No cart ID found")
    return NextResponse.redirect(
      buildRedirectUrl("/checkout?message=No cart found to complete order")
    )
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const cartRes = await sdk.store.cart.complete(id, {}, headers)

    if (cartRes?.type === "order") {
      const order = (cartRes as { type: "order"; order: HttpTypes.StoreOrder }).order
      console.log("[COMPLETE-CART] Order created:", order.id)

      // Remove cart cookie (allowed in Route Handlers)
      await removeCartId()

      // Redirect to checkout with order_id, status, and payment id for debugging
      const redirectUrl = buildRedirectUrl(`/checkout?order_id=${order.id}&status=paid`)
      if (moyasarId) {
        redirectUrl.searchParams.set("id", moyasarId)
      }
      return NextResponse.redirect(redirectUrl)
    }

    // Cart not ready - redirect back to checkout with status
    console.log("[COMPLETE-CART] Cart not ready, type:", cartRes?.type)
    const retryUrl = buildRedirectUrl("/checkout?status=paid&message=Order still processing")
    if (cartId) {
      retryUrl.searchParams.set("cart_id", cartId)
    }
    if (moyasarId) {
      retryUrl.searchParams.set("id", moyasarId)
    }
    return NextResponse.redirect(retryUrl)
  } catch (error) {
    console.error("[COMPLETE-CART] Error completing cart:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.redirect(
      buildRedirectUrl(`/checkout?message=${encodeURIComponent(message)}`)
    )
  }
}