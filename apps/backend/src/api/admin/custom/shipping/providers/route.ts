import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const PROVIDER_LABELS: Record<string, string> = {
  oto_oto:      "OTO",
  manual_manual: "Manual",
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // ------------------------------------------------------------------
    // 1. All fulfillment providers registered in the database
    // ------------------------------------------------------------------
    const { data: fulfillmentProviders } = await query.graph({
      entity: "fulfillment_provider",
      fields: ["id"],
    })

    // ------------------------------------------------------------------
    // 2. All shipping options with related data
    // ------------------------------------------------------------------
    const { data: shippingOptions } = await query.graph({
      entity: "shipping_option",
      fields: [
        "id",
        "name",
        "price_type",
        "provider_id",
        "shipping_profile.id",
        "shipping_profile.name",
        "service_zone.id",
        "service_zone.name",
        "type.label",
        "type.code",
        "type.description",
        "prices.id",
        "prices.currency_code",
        "prices.amount",
        "prices.min_quantity",
        "prices.max_quantity",
      ],
    })

    // ------------------------------------------------------------------
    // 3. Which providers are linked to at least one stock location
    // ------------------------------------------------------------------
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "fulfillment_providers.id"],
    })

    const activeProviderIds = new Set<string>()
    for (const loc of stockLocations as any[]) {
      for (const fp of (loc as any).fulfillment_providers ?? []) {
        activeProviderIds.add(fp.id)
      }
    }

    // ------------------------------------------------------------------
    // 4. Group shipping options by provider_id
    // ------------------------------------------------------------------
    const optionsByProvider = new Map<string, any[]>()
    for (const opt of shippingOptions as any[]) {
      const pid: string = opt.provider_id ?? "unknown"
      if (!optionsByProvider.has(pid)) optionsByProvider.set(pid, [])
      optionsByProvider.get(pid)!.push({
        id:               opt.id,
        name:             opt.name,
        price_type:       opt.price_type,
        type:             opt.type ?? null,
        shipping_profile: opt.shipping_profile ?? null,
        service_zone:     opt.service_zone ?? null,
        prices:           opt.prices ?? [],
      })
    }

    // ------------------------------------------------------------------
    // 5. Build response — every registered provider, with or without options
    // ------------------------------------------------------------------
    const providers = (fulfillmentProviders as any[]).map((fp) => ({
      provider_id: fp.id,
      label:       PROVIDER_LABELS[fp.id] ?? fp.id,
      active:      activeProviderIds.has(fp.id),
      has_api_key: checkHasApiKey(fp.id),
      options:     optionsByProvider.get(fp.id) ?? [],
    }))

    return res.status(200).json({ providers })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return res.status(500).json({ message })
  }
}

function checkHasApiKey(providerId: string): boolean {
  if (providerId === "oto_oto") {
    return !!(process.env.OTO_REFRESH_TOKEN && process.env.OTO_BASE_URL)
  }
  return true // manual and others need no key
}

