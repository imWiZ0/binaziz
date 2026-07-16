import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import { Heading } from "@modules/common/components/ui"

export const metadata: Metadata = {
  title: "Products",
}

export default async function ProductsPage() {
  const { response: { products } } = await listProducts({ pageParam: 1, queryParams: { limit: 12 } })

  return (
    <div className="py-12 content-container">
      <Heading level="h1" className="mb-8 text-2xl font-bold">All Products</Heading>
      <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-8">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
