import { Metadata } from "next"
import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Login",
}

export default function LoginPage() {
  return <LoginTemplate />
}
