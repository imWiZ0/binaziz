import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return (
      <div className="w-full p-6 bg-white border rounded-lg border-ui-border-base" data-testid="checkout-dependencies-error">
        <h2 className="text-lg font-semibold">Checkout is temporarily unavailable</h2>
        <p className="mt-2 text-ui-fg-subtle">
          We couldn&apos;t load shipping or payment options. This usually means the Store API endpoints are missing or failing.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <LocalizedClientLink href="/cart">
            <Button variant="secondary">Back to cart</Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/checkout?step=delivery">
            <Button>Try again</Button>
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <div className="grid w-full grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />

      <Shipping cart={cart} availableShippingMethods={shippingMethods} />

      <Payment cart={cart} availablePaymentMethods={paymentMethods} />

      <Review cart={cart} />
    </div>
  )
}
