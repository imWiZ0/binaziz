console.log("OTO INDEX LOADED")

import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import OtoFulfillmentProviderService from "./oto-provider"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [OtoFulfillmentProviderService],
})