import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { redirect } from "next/navigation"
import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Login",
}

type Props = {
  searchParams: Promise<{
    redirect_to?: string
  }>
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams
  const redirectTo = searchParams.redirect_to || "/account"

  const customer = await retrieveCustomer().catch(() => null)

  if (customer) {
    redirect(redirectTo)
  }

  return <LoginTemplate />
}
