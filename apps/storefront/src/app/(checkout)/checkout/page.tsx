import { retrieveCart, updateCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
// import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { retrieveOrder } from "@lib/data/orders"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

type Props = {
  params: Promise<{ countryCode?: string }>
  searchParams: Promise<{
    id?: string
    status?: string
    message?: string
    order_id?: string
    cart_id?: string
    step?: string
    login_redirect?: string
  }>
}

export default async function Checkout(props: Props) {
  const { countryCode } = await props.params
  const searchParams = await props.searchParams
  const status = String(searchParams.status || "").toLowerCase()

  // Check for order_id FIRST - this handles the redirect from /api/complete-cart
  // which redirects to /checkout?order_id=XXX (without status=paid)
  if (searchParams.order_id) {
    const order = await retrieveOrder(searchParams.order_id).catch(() => null)

    if (order) {
      return <OrderCompletedTemplate order={order} />
    }

    // Order ID was provided but order couldn't be found - show error
    return (
      <div className="py-16 content-container" data-testid="checkout-order-not-found">
        <div className="flex flex-col max-w-xl mx-auto text-center gap-y-4">
          <h1 className="text-2xl font-semibold">Order not found</h1>
          <p className="text-ui-fg-subtle">
            We couldn't find your order (ID: {searchParams.order_id}).
            Please contact support if you believe this is an error.
          </p>
          <LocalizedClientLink href="/" className="mx-auto">
            <Button>Continue shopping</Button>
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  // Show rejection page if payment was failed/rejected/canceled
  if (["failed", "declined", "canceled", "expired"].includes(status)) {
    return (
      <div className="py-16 content-container" data-testid="checkout-payment-rejected">
        <div className="flex flex-col max-w-xl mx-auto text-center gap-y-4">
          <h1 className="text-2xl font-semibold text-red-500">Payment Rejected</h1>
          <p className="text-ui-fg-subtle">
            {searchParams.message || "Your payment was rejected by the payment provider."}
          </p>
          {searchParams.id && (
            <p className="text-sm text-ui-fg-subtle">Payment ID: {searchParams.id}</p>
          )}
          <LocalizedClientLink href="/cart" className="mx-auto">
            <Button variant="secondary">Back to cart</Button>
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  if (["paid", "authorized", "captured"].includes(status)) {
    // order_id is already handled above (before status check)
    // If we reach here with status=paid but no order_id, complete the cart

    // Payment is confirmed but no order_id yet - redirect to route handler
    // to complete the cart. Route Handlers can modify cookies (Server Components cannot).
    // The route handler will complete the cart and redirect to /checkout?order_id=XXX
    const completeCartParams = new URLSearchParams()
    if (searchParams.cart_id) {
      completeCartParams.set("cart_id", searchParams.cart_id)
    }
    if (searchParams.id) {
      completeCartParams.set("id", searchParams.id)
    }
    redirect(`/api/complete-cart?${completeCartParams.toString()}`)
  }

  // If there's an error message (e.g., from failed order creation), show it
  if (searchParams.message && !status) {
    return (
      <div className="py-16 content-container" data-testid="checkout-error">
        <div className="flex flex-col max-w-xl mx-auto text-center gap-y-4">
          <h1 className="text-2xl font-semibold text-red-500">Payment Error</h1>
          <p className="text-ui-fg-subtle">{searchParams.message}</p>
          {searchParams.id && (
            <p className="text-ui-fg-subtle">Payment ID: {searchParams.id}</p>
          )}
          <div className="flex gap-4 justify-center">
            <LocalizedClientLink href="/cart" className="mx-auto">
              <Button variant="secondary">Back to cart</Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/" className="mx-auto">
              <Button>Continue shopping</Button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    )
  }

  const cart = await retrieveCart()

  if (!cart) {
    return (
      <div className="py-16 content-container" data-testid="checkout-missing-cart">
        <div className="flex flex-col max-w-xl mx-auto text-center gap-y-4">
          <h1 className="text-2xl font-semibold">No active cart found</h1>
          <p className="text-ui-fg-subtle">
            Your checkout couldn't be loaded because we couldn't find an active cart.
          </p>
          <LocalizedClientLink href="/cart" className="mx-auto">
            <Button>Back to cart</Button>
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  // Only require login for the initial checkout, not for payment callbacks
  const isPaymentCallback = ["paid", "authorized", "captured", "failed", "declined", "canceled", "expired"].includes(status) || searchParams.id

  const customer = await retrieveCustomer().catch(() => null)

  if (!customer && !isPaymentCallback) {
    redirect(
      `/account/login?redirect_to=${encodeURIComponent(
        "/checkout?login_redirect=true"
      )}`
    )
  }

  // When returning from login, determine the correct checkout step based on
  // the customer's saved addresses and the current cart state.
  // - If the customer has saved addresses, auto-fill the cart's shipping
  //   address and skip to the delivery step.
  // - If the customer has no saved addresses, start at the address step.
  if (searchParams.login_redirect === "true" && customer) {
    const hasShippingAddress =
      cart.shipping_address &&
      cart.shipping_address.address_1 &&
      cart.shipping_address.first_name

    if (hasShippingAddress) {
      // Cart already has a shipping address — go to delivery (or further
      // depending on cart state).
      const hasShippingMethods = (cart.shipping_methods?.length ?? 0) > 0
      const targetStep = hasShippingMethods ? "payment" : "delivery"
      redirect(`/checkout?step=${targetStep}`)
    }

    // Try to auto-fill from the customer's saved addresses. Only consider
    // addresses whose country code is in the cart's region, otherwise the
    // shipping address won't be valid for the available shipping methods.
    const savedAddresses = customer.addresses ?? []
    const regionCountryCodes =
      (cart.region?.countries?.map((c) => c.iso_2) as string[] | undefined) ??
      []
    const addressesInRegion = savedAddresses.filter(
      (a) =>
        a.country_code && regionCountryCodes.includes(a.country_code)
    )
    if (addressesInRegion.length > 0) {
      // Prefer the default shipping address in region, otherwise the first
      // matching one.
      const defaultAddr =
        addressesInRegion.find((a) => a.is_default_shipping) ??
        addressesInRegion[0]

      const addressData = {
        first_name: defaultAddr.first_name,
        last_name: defaultAddr.last_name,
        address_1: defaultAddr.address_1,
        address_2: defaultAddr.address_2 ?? "",
        company: defaultAddr.company ?? "",
        postal_code: defaultAddr.postal_code,
        city: defaultAddr.city,
        country_code: defaultAddr.country_code,
        province: defaultAddr.province ?? "",
        phone: defaultAddr.phone ?? "",
      }

      try {
        await updateCart({
          shipping_address: addressData as any,
          billing_address: addressData as any,
          email: customer.email,
        } as any)
      } catch {
        // If auto-fill fails, fall through to the address step so the user
        // can fill it manually.
        redirect(`/checkout?step=address`)
      }

      redirect(`/checkout?step=delivery`)
    }

    // No saved addresses — user must fill in the address form.
    redirect(`/checkout?step=address`)
  }

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      {/* <PaymentWrapper cart={cart}> */}
        <CheckoutForm cart={cart} customer={customer} />
      {/* </PaymentWrapper> */}
      <CheckoutSummary cart={cart} />
    </div>
  )
}
