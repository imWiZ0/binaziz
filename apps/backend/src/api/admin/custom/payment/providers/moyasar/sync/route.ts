import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type QueryService = {
  graph: (input: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
  }) => Promise<{ data: Array<{ id: string; payment_providers?: Array<{ id: string }> }> }>
}

type PaymentModuleService = {
  updatePaymentCollection: (input: {
    id: string
    payment_providers: string[]
  }) => Promise<unknown>
}

const MOYASAR_PROVIDER_ID = "pp_moyasar_default"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as QueryService
    const paymentModule = req.scope.resolve("payment") as unknown as PaymentModuleService

    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "payment_providers.id"],
      filters: {},
    })

    let updatedRegions = 0

    for (const region of regions) {
      const existingProviderIds = (region.payment_providers || []).map(
        (provider) => provider.id
      )

      if (existingProviderIds.includes(MOYASAR_PROVIDER_ID)) {
        continue
      }

      await paymentModule.updatePaymentCollection({
        id: region.id,
        payment_providers: [...existingProviderIds, MOYASAR_PROVIDER_ID],
      })

      updatedRegions += 1
    }

    return res.status(200).json({
      provider_id: MOYASAR_PROVIDER_ID,
      regions_total: regions.length,
      regions_updated: updatedRegions,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"

    return res.status(500).json({
      message,
    })
  }
}
