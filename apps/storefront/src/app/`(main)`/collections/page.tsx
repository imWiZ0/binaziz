import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading } from "@modules/common/components/ui"

export const metadata: Metadata = {
  title: "Collections",
}

export default async function CollectionsPage() {
  const collections = await listCollections().catch(() => [])

  return (
    <div className="py-12 content-container">
      <Heading level="h1" className="mb-8 text-2xl font-bold">Collections</Heading>
      <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <LocalizedClientLink
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{collection.title}</h2>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
