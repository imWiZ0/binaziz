import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Transfer",
}

export default function TransferPage() {
  return (
    <div className="py-12 content-container">
      <h1 className="text-2xl font-bold mb-8">Transfer Request</h1>
      <p className="text-ui-fg-subtle">Transfer page content goes here.</p>
    </div>
  )
}
