import { Metadata } from "next"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "All Products",
}

export default function StorePage() {
  return <StoreTemplate />
}
