import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import MoyasarPaymentProviderService from "./moyasar-provider"

export default ModuleProvider(Modules.PAYMENT, {
  services: [MoyasarPaymentProviderService],
})