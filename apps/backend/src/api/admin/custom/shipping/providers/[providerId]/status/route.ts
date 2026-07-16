import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * POST /admin/custom/shipping/providers/:providerId/status
 *
 * Activates or deactivates a fulfillment provider by creating or
 * removing its link to every stock location.
 */
export async function POST(
  req: MedusaRequest<{ active: boolean }>,
  res: MedusaResponse
) {
  try {
    const { providerId } = req.params as { providerId: string }
    const { active } = req.body as { active: boolean }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const link  = req.scope.resolve(ContainerRegistrationKeys.LINK)

    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "fulfillment_providers.id"],
    })

    let changed = 0

    for (const location of stockLocations as any[]) {
      const existingIds = new Set<string>(
        (location.fulfillment_providers ?? []).map((fp: any) => fp.id as string)
      )

      if (active && !existingIds.has(providerId)) {
        await link.create({
          [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
          [Modules.FULFILLMENT]:    { fulfillment_provider_id: providerId },
        })
        changed++
      }

      if (!active && existingIds.has(providerId)) {
        await link.dismiss({
          [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
          [Modules.FULFILLMENT]:    { fulfillment_provider_id: providerId },
        })
        changed++
      }
    }

    return res.status(200).json({ provider_id: providerId, active, locations_changed: changed })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return res.status(500).json({ message })
  }
}
