export type OtoCarrier = "SMSA" | "ARAMEX" | "REDBOX"

export interface OtoFulfillmentOption {
  id: OtoCarrier
  carrier: OtoCarrier
  name: string
  [k: string]: unknown
}

export const OTO_FULFILLMENT_OPTIONS: OtoFulfillmentOption[] = [
  { id: "ARAMEX", carrier: "ARAMEX", name: "Aramex" },
  { id: "SMSA",   carrier: "SMSA",   name: "SMSA"   },
  { id: "REDBOX", carrier: "REDBOX", name: "Redbox" },
]