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
  title: "Payment Approved",
  description: "Your payment was approved.",
}

export default async function CheckoutApprovedPage(props: Props) {
  const searchParams = await props.searchParams

  const status = (searchParams.status || "paid").toUpperCase()
  const message =
    searchParams.message ||
    "Payment approved successfully. We are finalizing your order."

  return (
    <div className="py-16 content-container">
      <div className="max-w-xl p-8 mx-auto bg-white border rounded-lg border-ui-border-base">
        <h1 className="text-2xl font-semibold text-ui-fg-base">Payment Approved</h1>
        <p className="mt-3 text-ui-fg-subtle">{message}</p>
        <p className="mt-2 text-sm text-ui-fg-muted">Status: {status}</p>
        {searchParams.payment_id && (
          <p className="mt-1 text-xs break-all text-ui-fg-muted">
            Payment ID: {searchParams.payment_id}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <LocalizedClientLink href="/account/orders">
            <Button>View My Orders</Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/">
            <Button variant="secondary">Continue Shopping</Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
