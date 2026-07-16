import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Decline Transfer",
}

export default function DeclineTransferPage() {
  return (
    <div className="py-12 content-container">
      <h1 className="text-2xl font-bold mb-8">Decline Transfer</h1>
      <p className="text-ui-fg-subtle">Decline transfer page content goes here.</p>
    </div>
  )
}
