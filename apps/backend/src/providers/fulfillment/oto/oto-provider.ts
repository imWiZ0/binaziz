import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import type { CreateFulfillmentResult, FulfillmentOption } from "@medusajs/types"
import OtoService from "./oto-api-service"
import { OTO_FULFILLMENT_OPTIONS, OtoCarrier } from "./types"

class OtoFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = "oto"

  // Shipping options presented in Medusa Admin
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return OTO_FULFILLMENT_OPTIONS
  }

  // Validate that the option data has a supported carrier
  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    const carrier = data.carrier as string
    return OTO_FULFILLMENT_OPTIONS.some((o) => o.carrier === carrier)
  }

  // Validate fulfillment data at checkout (pass-through)
  async validateFulfillmentData(optionData: Record<string, unknown>, data: Record<string, unknown>, _context: Record<string, unknown>) {
    return { ...optionData, ...data }
  }

  // Create fulfillment → call OTO createOrder with carrier
  async createFulfillment(data: Record<string, unknown>, items: any[], order: any, fulfillment: any): Promise<CreateFulfillmentResult> {
    try {
      const carrier = data.carrier as OtoCarrier
      const shippingAddress = order?.shipping_address ?? fulfillment?.shipping_address
      
      console.log("[OTO] Creating fulfillment for order:", order?.id, "fulfillment:", fulfillment?.id, "carrier:", carrier)

      // Validate required address fields
      if (!shippingAddress) {
        throw new Error("Shipping address is missing")
      }
      
      if (!shippingAddress.country_code) {
        throw new Error("Country code is required")
      }
      
      if (!shippingAddress.city) {
        throw new Error("City is required")
      }

      const payload = {
        carrier,
        order_reference: order?.id ?? fulfillment?.id,
        consignee: {
          name: [shippingAddress?.first_name, shippingAddress?.last_name].filter(Boolean).join(" "),
          phone: shippingAddress?.phone ?? "",
          address: {
            line1:    shippingAddress?.address_1 ?? "",
            line2:    shippingAddress?.address_2 ?? "",
            city:     shippingAddress?.city ?? "",
            country:  shippingAddress?.country_code?.toUpperCase() ?? "",
            postcode: shippingAddress?.postal_code ?? "",
          },
        },
        parcels: items.map((item) => ({
          reference:   item.id ?? item.item_id,
          description: item.title ?? item.product_title ?? "Item",
          quantity:    item.quantity ?? 1,
        })),
      }

      console.log("[OTO] Request payload:", JSON.stringify(payload, null, 2))

      const oto = await OtoService.create()
      const result = await oto.createOrder(payload)

      console.log("[OTO] API response:", JSON.stringify(result, null, 2))

      if (!result?.order_id && !result?.id) {
        console.warn("[OTO] Warning: No order_id or id in response")
      }

      return {
        data: {
          carrier,
          oto_order_id: result?.order_id ?? result?.id,
        },
        labels: [],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("[OTO] Error creating fulfillment:", errorMessage, error)
      
      // Return partial result so Medusa doesn't fail the entire order
      // The order will still be created in Medusa, but fulfillment will show as failed
      return {
        data: {
          carrier: data.carrier as OtoCarrier,
          oto_order_id: null,
          error: errorMessage,
        },
        labels: [],
      }
    }
  }

  // Cancel fulfillment → call OTO cancelOrder
  async cancelFulfillment(fulfillment: any): Promise<any> {
    try {
      const otoOrderId = fulfillment?.data?.oto_order_id

      if (!otoOrderId) {
        console.log("[OTO] No OTO order ID found in fulfillment, skipping cancel")
        return {}
      }

      console.log("[OTO] Cancelling OTO order:", otoOrderId)
      
      const oto = await OtoService.create()
      const result = await oto.cancelOrder({ order_id: otoOrderId })
      
      console.log("[OTO] Cancel response:", result)
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("[OTO] Error cancelling fulfillment:", errorMessage, error)
      return { error: errorMessage }
    }
  }

  async calculatePrice(optionData: Record<string, unknown>, data: Record<string, unknown>, context: any): Promise<{ calculated_amount: number; is_calculated_price_tax_inclusive: boolean }> {
    try {
      const carrier = optionData.carrier as OtoCarrier
      const shippingAddress = data.shipping_address as any
      
      console.log("[OTO] Calculating price for carrier:", carrier, "address:", shippingAddress)

      if (!shippingAddress) {
        console.warn("[OTO] No shipping address for price calculation, returning 0")
        return {
          calculated_amount: 0,
          is_calculated_price_tax_inclusive: false,
        }
      }

      const oto = await OtoService.create()
      
      const payload = {
        carrier,
        origin: {
          city: context?.region?.country_code ? context.region.country_code.toUpperCase() : "SA",
          country: context?.region?.country_code ? context.region.country_code.toUpperCase() : "SA",
        },
        destination: {
          city: shippingAddress?.city ?? "",
          country: shippingAddress?.country_code?.toUpperCase() ?? "",
          postcode: shippingAddress?.postal_code ?? "",
        },
        parcels: (data.items as any[] ?? []).map(item => ({
          weight: item.weight ?? 0.5,
          length: item.length ?? 10,
          width: item.width ?? 10,
          height: item.height ?? 10,
        })),
      }

      console.log("[OTO] Price calculation payload:", JSON.stringify(payload, null, 2))
      
      const result = await oto.getDeliveryFee(payload)
      
      console.log("[OTO] Price calculation result:", result)

      return {
        calculated_amount: Number(result?.total ?? 0),
        is_calculated_price_tax_inclusive: false,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("[OTO] Error calculating price:", errorMessage, error)
      
      // Return 0 to not block checkout, but log the error
      return {
        calculated_amount: 0,
        is_calculated_price_tax_inclusive: false,
      }
    }
  }
}

export default OtoFulfillmentProviderService