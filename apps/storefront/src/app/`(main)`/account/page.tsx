import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { redirect } from "next/navigation"
import AccountLayout from "@modules/account/templates/account-layout"
import OverviewTemplate from "@modules/account/components/overview"

export const metadata: Metadata = {
  title: "Account",
}

export default async function AccountPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    redirect("/account/login")
  }

  return (
    <AccountLayout>
      <OverviewTemplate customer={customer} />
    </AccountLayout>
  )
}
