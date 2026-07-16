import { Metadata } from "next"
import { getProductByHandle, getProductById, listProducts } from "@lib/data/products"
import ProductTemplate from "@modules/products/templates"
import { getRegion } from "@lib/data/regions"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Product",
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const region = await getRegion()

  // Try by handle first, then by ID
  let product = await getProductByHandle(handle, { regionId: region?.id })
  
  if (!product) {
    product = await getProductById(handle, { regionId: region?.id })
  }

  // If still not found, try searching by title match
  if (!product) {
    const { response: { products } } = await listProducts({
      pageParam: 1,
      queryParams: { limit: 1, q: handle },
      regionId: region?.id,
    })
    product = products?.[0] || null
  }

  if (!product || !region) {
    notFound()
  }

  const images = product.images || []

  return <ProductTemplate product={product} region={region} images={images} />
}
