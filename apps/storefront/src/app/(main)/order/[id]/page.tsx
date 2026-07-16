import { Metadata } from "next"
import { retrieveOrder } from "@lib/data/orders"
import OrderTemplate from "@modules/order/templates/order-template"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Order",
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  return <OrderTemplate order={order} />
}
