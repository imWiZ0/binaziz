import { Metadata } from "next"
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading } from "@modules/common/components/ui"

export const metadata: Metadata = {
  title: "Categories",
}

export default async function CategoriesPage() {
  const categories = await listCategories().catch(() => [])

  return (
    <div className="py-12 content-container">
      <Heading level="h1" className="mb-8 text-2xl font-bold">Categories</Heading>
      <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-6">
        {categories.map((category) => (
          <LocalizedClientLink
            key={category.id}
            href={`/categories/${category.handle || category.id}`}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{category.name}</h2>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
