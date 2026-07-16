import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import { redirect } from "next/navigation"
import AccountLayout from "@modules/account/templates/account-layout"
import ProfileTemplate from "@modules/account/components/profile-name"

export const metadata: Metadata = {
  title: "Profile",
}

export default async function ProfilePage() {
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
      <ProfileTemplate customer={customer} />
    </AccountLayout>
  )
}
