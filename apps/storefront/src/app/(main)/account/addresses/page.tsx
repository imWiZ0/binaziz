import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import { redirect } from "next/navigation"
import AccountLayout from "@modules/account/templates/account-layout"
import AddressBookTemplate from "@modules/account/components/address-book"

export const metadata: Metadata = {
  title: "Addresses",
}

export default async function AddressesPage() {
  const customer = await retrieveCustomer().catch(() => null)
  const region = await getRegion()

  if (!customer) {
    redirect("/account/login")
  }

  if (!region) {
    redirect("/")
  }

  return (
    <AccountLayout customer={customer}>
      <AddressBookTemplate customer={customer} region={region} />
    </AccountLayout>
  )
}
