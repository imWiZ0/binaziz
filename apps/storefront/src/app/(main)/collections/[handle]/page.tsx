import { Metadata } from "next"
import { getCollectionByHandle } from "@lib/data/collections"
import CollectionTemplate from "@modules/collections/templates"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Collection",
}

export default async function CollectionPage({ params }: { params: { handle: string } }) {
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return <CollectionTemplate collection={collection} />
}
