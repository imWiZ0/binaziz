import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accept Transfer",
}

export default function AcceptTransferPage() {
  return (
    <div className="py-12 content-container">
      <h1 className="text-2xl font-bold mb-8">Accept Transfer</h1>
      <p className="text-ui-fg-subtle">Accept transfer page content goes here.</p>
    </div>
  )
}
