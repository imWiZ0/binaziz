import { Metadata } from "next"
import VerifyAccountTemplate from "@modules/account/components/verify-account"

export const metadata: Metadata = {
  title: "Verify Account",
}

export default function VerifyAccountPage() {
  return <VerifyAccountTemplate />
}
