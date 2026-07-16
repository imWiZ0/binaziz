"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = { ...(await getCacheOptions("regions")) }

  return await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
    method: "GET",
    next,
    cache: "no-store",
  }).then(({ regions }) => regions)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "no-store",
    })
    .then(({ region }) => region)
}

export const getRegion = async () => {
  const regions = await listRegions()

  return regions?.[0] ?? null
}
