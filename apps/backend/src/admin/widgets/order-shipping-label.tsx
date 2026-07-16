import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useMemo } from "react"

type OrderWidgetProps = {
  data?: {
    id?: string
    display_id?: string | number
  }
}

const OrderShippingLabelWidget = ({ data }: OrderWidgetProps) => {
  const orderId = data?.id
  const orderDisplayId = data?.display_id

  const disabled = useMemo(() => !orderId, [orderId])

  const onDownload = () => {
    if (!orderId) {
      return
    }

    const url = `/admin/custom/orders/${orderId}/shipping-label`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="overflow-hidden border rounded-lg border-ui-border-base bg-ui-bg-base">
      <div className="px-6 py-4 border-b border-ui-border-base">
        <h2 className="text-lg font-medium text-ui-fg-base">Shipping Label</h2>
        <p className="mt-1 text-sm text-ui-fg-subtle">
          Generate and download a PDF label for order
          {orderDisplayId ? ` #${orderDisplayId}` : ""} based on the shipping
          option selected by the customer at checkout.
        </p>
      </div>

      <div className="flex items-end gap-3 px-6 py-4">
        <button
          type="button"
          disabled={disabled}
          onClick={onDownload}
          className="h-10 px-4 rounded-md bg-ui-bg-interactive text-ui-fg-on-color hover:bg-ui-bg-interactive-hover disabled:bg-ui-bg-disabled disabled:text-ui-fg-disabled"
        >
          Download PDF Label
        </button>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderShippingLabelWidget
