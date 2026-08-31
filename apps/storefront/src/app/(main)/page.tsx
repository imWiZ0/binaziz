import { Metadata } from "next"

import { listProductsWithSort } from "@lib/data/products"
import Hero from "@modules/home/components/hero"
import ProductPreview from "@modules/products/components/product-preview"
import { Heading } from "@modules/common/components/ui"

export const metadata: Metadata = {
  title: "متجر بن عزيز",
  description:
    "متجر بن عزيز لجميع الحرف الفنية.",
}

export default async function Home() {
  const { response: { products } } = await listProductsWithSort({
    page: 1,
    queryParams: { limit: 12 },
  })

  return (
    <>
      <Hero />
      <div className="py-12 content-container small:py-24">
        <Heading level="h2" className="mb-8 text-2xl font-normal text-ui-fg-base">
          Featured Products
        </Heading>
        <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-24 small:gap-y-36">
          {products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}