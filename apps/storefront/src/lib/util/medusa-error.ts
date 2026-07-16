/** Matches Medusa JS SDK's FetchError shape (throws when status >= 300) */
type SDKFetchError = {
  message: string
  statusText: string
  status: number
}

/** Old Medusa v1 Axios-style error shape */
type LegacyMedusaError = {
  response?: {
    data: { message?: string } | string
    status: number
    headers: unknown
  }
  request?: unknown
  message?: string
  config?: { url: string; baseURL: string }
}

export default function medusaError(error: unknown): never {
  const fetchErr = error as SDKFetchError
  const legacyErr = error as LegacyMedusaError

  // Medusa JS SDK v2 throws FetchError with status/statusText (no response/request)
  if (typeof fetchErr.status === "number") {
    const message =
      fetchErr.message || fetchErr.statusText || "An unknown error occurred"
    console.error(`API error (${fetchErr.status}): ${message}`)
    throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
  }

  if (legacyErr.response) {
    const u = legacyErr.config?.url
      ? new URL(legacyErr.config.url, legacyErr.config.baseURL ?? "").toString()
      : "unknown"
    console.error("Resource:", u)
    console.error("Response data:", legacyErr.response.data)
    console.error("Status code:", legacyErr.response.status)
    console.error("Headers:", legacyErr.response.headers)

    const data = legacyErr.response.data
    const message =
      typeof data === "object" && data !== null
        ? data.message || String(data)
        : data

    throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
  } else if (legacyErr.request) {
    throw new Error("No response received: " + String(legacyErr.request))
  } else {
    throw new Error(
      "Error setting up the request: " +
        (error instanceof Error
          ? error.message
          : String(error) || "An unknown error occurred")
    )
  }
}
