import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveOrder } from "@lib/data/orders"
import { redirect } from "next/navigation"
import AccountLayout from "@modules/account/templates/account-layout"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"

export const metadata: Metadata = {
  title: "Order Details",
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    redirect("/account/login")
  }

  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    redirect("/account/orders")
  }

  return (
    <AccountLayout customer={customer}>
      <div className="py-12" data-testid="order-details-page">
        <OrderDetailsTemplate order={order} />
      </div>
    </AccountLayout>
  )
}
