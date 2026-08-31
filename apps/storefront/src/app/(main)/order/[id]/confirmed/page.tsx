import { Metadata } from "next"
import { retrieveOrder } from "@lib/data/orders"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Order Confirmed",
}

export default async function OrderConfirmedPage({ params }: { params: { id: string } }) {
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  return <OrderCompletedTemplate order={order} />
}
