import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * POST /admin/custom/shipping/providers/sync
 *
 * Links every registered fulfillment provider to every stock location
 * that does not yet have it linked. This makes providers available for
 * shipping-option creation in those locations.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const link  = req.scope.resolve(ContainerRegistrationKeys.LINK)

    // All stock locations with their already-linked providers
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "fulfillment_providers.id"],
    })

    // All fulfillment providers registered in the system
    const { data: fulfillmentProviders } = await query.graph({
      entity: "fulfillment_provider",
      fields: ["id"],
    })

    let linked = 0

    for (const location of stockLocations as any[]) {
      const existingIds = new Set<string>(
        (location.fulfillment_providers ?? []).map((fp: any) => fp.id as string)
      )

      for (const provider of fulfillmentProviders as any[]) {
        if (existingIds.has(provider.id)) continue

        await link.create({
          [Modules.STOCK_LOCATION]: {stock_location_id: location.id},
          [Modules.FULFILLMENT]: {fulfillment_provider_id: provider.id},
        })

        linked++
      }
    }

    return res.status(200).json({
      locations_total: stockLocations.length,
      providers_total: fulfillmentProviders.length,
      links_created: linked,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return res.status(500).json({ message })
  }
}
