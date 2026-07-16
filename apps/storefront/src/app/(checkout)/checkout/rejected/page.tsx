import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"
import { Metadata } from "next"

type Props = {
  searchParams: Promise<{
    status?: string
    message?: string
    payment_id?: string
  }>
}

export const metadata: Metadata = {
  title: "Payment Rejected",
  description: "Your payment was not approved.",
}

export default async function CheckoutRejectedPage(props: Props) {
  const searchParams = await props.searchParams

  const status = (searchParams.status || "failed").toUpperCase()
  const message =
    searchParams.message ||
    "Your payment was rejected by the payment provider. Please try another card or payment method."

  return (
    <div className="py-16 content-container">
      <div className="max-w-xl p-8 mx-auto bg-white border rounded-lg border-ui-border-base">
        <h1 className="text-2xl font-semibold text-ui-fg-error">Payment Rejected</h1>
        <p className="mt-3 text-ui-fg-subtle">{message}</p>
        <p className="mt-2 text-sm text-ui-fg-muted">Status: {status}</p>
        {searchParams.payment_id && (
          <p className="mt-1 text-xs break-all text-ui-fg-muted">
            Payment ID: {searchParams.payment_id}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <LocalizedClientLink href="/checkout?step=payment">
            <Button>Try Payment Again</Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/cart">
            <Button variant="secondary">Back to Cart</Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
