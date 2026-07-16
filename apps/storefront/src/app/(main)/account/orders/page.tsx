import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { redirect } from "next/navigation"
import AccountLayout from "@modules/account/templates/account-layout"
import OrderOverview from "@modules/account/components/order-overview"
import { Heading } from "@modules/common/components/ui"

export const metadata: Metadata = {
  title: "Orders",
}

export default async function OrdersPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    redirect("/account/login")
  }

  const orders = await listOrders(100).catch(() => [])

  return (
    <AccountLayout customer={customer}>
      <div className="py-12" data-testid="orders-container">
        <Heading level="h1" className="mb-8">
          Your Orders
        </Heading>
        <OrderOverview orders={orders} />
      </div>
    </AccountLayout>
  )
}
