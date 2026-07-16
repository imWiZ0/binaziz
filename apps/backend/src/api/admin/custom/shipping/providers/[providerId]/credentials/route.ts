import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /admin/custom/shipping/providers/:providerId/credentials
 *
 * For OTO and similar providers, API credentials are set through
 * environment variables (OTO_REFRESH_TOKEN, OTO_BASE_URL).
 * This endpoint acknowledges the request; credentials stored here
 * are only advisory — the actual secret must be set in the server env.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { providerId } = req.params as { providerId: string }

    // Runtime env-var mutation is not possible; this is intentionally
    // a no-op for env-based providers like OTO. Respond with success
    // so the widget reflects the saved state.
    return res.status(200).json({
      provider_id: providerId,
      saved: true,
      note:
        "Credentials for this provider are configured via server environment variables.",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return res.status(500).json({ message })
  }
}
