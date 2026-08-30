import "dotenv/config"
import axios, { Method } from "axios"

export const api = axios.create({
  baseURL: process.env.OTO_BASE_URL,
})

export default class OtoService {
  private static instance: OtoService

  private activeToken = ""
  private tokenExpiresAt = 0

  private constructor() {}

  static async create() {
    if (!this.instance) {
      const service = new OtoService()

      try {
        await service.refreshToken()
        this.instance = service
      } catch (error) {
        console.error("[OTO] Failed to create OTO service:", error)
        throw error
      }
    }

    return this.instance
  }

  private async refreshToken() {
    console.log("[OTO] Refreshing token...")
    
    if (!process.env.OTO_REFRESH_TOKEN) {
      throw new Error("OTO_REFRESH_TOKEN environment variable is not set")
    }
    
    if (!process.env.OTO_BASE_URL) {
      throw new Error("OTO_BASE_URL environment variable is not set")
    }

    try {
      const response = await api.post("/rest/v2/refreshToken", {
        refresh_token: process.env.OTO_REFRESH_TOKEN,
      })

      if (!response.data?.access_token) {
        throw new Error("No access token in response")
      }

      this.activeToken = response.data.access_token
      this.tokenExpiresAt = Date.now() + 59 * 60 * 1000

      console.log("[OTO] Token refreshed successfully")

      return this.activeToken
    } catch (error) {
      console.error("[OTO] Failed to refresh token:", error)
      throw new Error(`Failed to refresh OTO token: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async getToken() {
    const isExpired = !this.activeToken || Date.now() >= this.tokenExpiresAt

    if (isExpired) {
      await this.refreshToken()
    }

    return this.activeToken
  }

  private async request<T = any>(method: Method, url: string, data?: any): Promise<T> {
    const token = await this.getToken()

    console.log(`[OTO] API request: ${method} ${url}`)
    
    try {
      const response = await api.request<T>({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.data) {
        throw new Error("No data in response")
      }

      console.log(`[OTO] API response: ${method} ${url} - Success`)
      
      return response.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[OTO] API request failed: ${method} ${url}`, errorMessage, error)
      throw new Error(`OTO API request failed: ${errorMessage}`)
    }
  }

  public async healthCheck() {
    const response = await this.request<{status: string}>("GET", "/rest/v2/healthCheck")

    return response.status
  }

  public async getPickupLocation() {
    return this.request("GET", "/rest/v2/getPickupLocation")
  }

  public async changePickupLocation(payload: any) {
    return this.request("POST", "/rest/v2/changePickupLocation", payload)
  }

  public async createOrder(payload: any) {
    return this.request("POST", "/rest/v2/createOrder", payload)
  }

  public async cancelOrder(payload: any) {
    return this.request("POST", "/rest/v2/cancelOrder", payload)
  }

  public async createShipment(payload: any) {
    return this.request("POST", "/rest/v2/createShipment", payload)
  }

  public async getDeliveryFee(payload: any) {
    return this.request("POST", "/rest/v2/getDeliveryFee", payload)
  }

  public async getUserCredits() {
    return this.request("GET", "/rest/v2/userCredits")
  }

  public async addCredits(payload: any) {
    return this.request("POST", "/rest/v2/buyCredit", payload)
  }
}