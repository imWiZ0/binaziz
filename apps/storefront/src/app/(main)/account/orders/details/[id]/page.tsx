import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveOrder } from "@lib/data/orders"
import { redirect } from "next/navigation"
import AccountLayout from "@modules/account/templates/account-layout"
import OrderCard from "@modules/account/components/order-card"
import { Heading } from "@modules/common/components/ui"

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
      <div className="py-12" data-testid="order-details-container">
        <Heading level="h1" className="mb-8">
          Order #{order.display_id}
        </Heading>
        <OrderCard order={order} />
      </div>
    </AccountLayout>
  )
}
