import { Metadata } from "next"
import { getCategoryByHandle, getCategoryById } from "@lib/data/categories"
import CategoryTemplate from "@modules/categories/templates"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Category",
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string[] }> }) {
  const { category } = await params
  const categoryHandle = category.join("/")
  
  // Try by handle first, then by ID
  let resolvedCategory = await getCategoryByHandle([categoryHandle])

  if (!resolvedCategory) {
    // If handle didn't work, try by ID
    resolvedCategory = await getCategoryById(categoryHandle)
  }

  if (!resolvedCategory) {
    notFound()
  }

  return <CategoryTemplate category={resolvedCategory} />
}
