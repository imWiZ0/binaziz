import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useCallback, useEffect, useMemo, useState } from "react"

type PriceRow = {
  id?: string
  currency_code?: string
  amount?: number
  min_quantity?: number | null
  max_quantity?: number | null
}

type ProviderOption = {
  id: string
  name: string
  price_type?: string
  type?: {
    label?: string
    code?: string
    description?: string
  } | null
  shipping_profile?: {
    id?: string
    name?: string
  } | null
  service_zone?: {
    id?: string
    name?: string
  } | null
  prices?: PriceRow[]
}

type ProviderItem = {
  provider_id: string
  label?: string
  active: boolean
  has_api_key?: boolean
  options: ProviderOption[]
}

type ShippingProvidersResponse = {
  providers: ProviderItem[]
}

const moneyFormatter = (amount?: number, currencyCode?: string) => {
  if (typeof amount !== "number" || !currencyCode) {
    return "-"
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(amount)
  } catch {
    return `${amount} ${currencyCode.toUpperCase()}`
  }
}

const ShippingProvidersManagementWidget = () => {
  const [providers, setProviders] = useState<ProviderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingProviderId, setSavingProviderId] = useState<string | null>(null)
  const [savingApiKeyProviderId, setSavingApiKeyProviderId] = useState<string | null>(null)
  const [syncingProviders, setSyncingProviders] = useState(false)
  const [apiKeyDraftByProvider, setApiKeyDraftByProvider] = useState<
    Record<string, string>
  >({})

  const loadProviders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/admin/custom/shipping/providers", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to load providers (${response.status})`)
      }

      const data = (await response.json()) as ShippingProvidersResponse
      setProviders(data.providers || [])

      setApiKeyDraftByProvider((prev) => {
        const next = { ...prev }
        for (const provider of data.providers || []) {
          if (!(provider.provider_id in next)) {
            next[provider.provider_id] = ""
          }
        }
        return next
      })
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load providers"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProviders()
  }, [loadProviders])

  const onToggle = useCallback(
    async (providerId: string, active: boolean) => {
      setSavingProviderId(providerId)
      setError(null)

      try {
        const response = await fetch(
          `/admin/custom/shipping/providers/${encodeURIComponent(providerId)}/status`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ active }),
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to update provider (${response.status})`)
        }

        setProviders((prev) =>
          prev.map((provider) =>
            provider.provider_id === providerId
              ? { ...provider, active }
              : provider
          )
        )
      } catch (toggleError) {
        const message =
          toggleError instanceof Error
            ? toggleError.message
            : "Failed to update provider"
        setError(message)
      } finally {
        setSavingProviderId(null)
      }
    },
    []
  )

  const onSyncProviders = useCallback(async () => {
    setSyncingProviders(true)
    setError(null)

    try {
      const response = await fetch("/admin/custom/shipping/providers/sync", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to sync providers (${response.status})`)
      }

      await loadProviders()
    } catch (syncError) {
      const message =
        syncError instanceof Error
          ? syncError.message
          : "Failed to sync providers"
      setError(message)
    } finally {
      setSyncingProviders(false)
    }
  }, [loadProviders])

  const onSaveApiKey = useCallback(
    async (providerId: string) => {
      setSavingApiKeyProviderId(providerId)
      setError(null)

      try {
        const apiKey = (apiKeyDraftByProvider[providerId] || "").trim()
        const response = await fetch(
          `/admin/custom/shipping/providers/${encodeURIComponent(providerId)}/credentials`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ api_key: apiKey }),
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to save API key (${response.status})`)
        }

        setProviders((prev) =>
          prev.map((provider) =>
            provider.provider_id === providerId
              ? {
                  ...provider,
                  has_api_key: !!apiKey,
                  active: apiKey ? provider.active : false,
                }
              : provider
          )
        )
      } catch (credentialsError) {
        const message =
          credentialsError instanceof Error
            ? credentialsError.message
            : "Failed to save API key"
        setError(message)
      } finally {
        setSavingApiKeyProviderId(null)
      }
    },
    [apiKeyDraftByProvider]
  )

  const sortedProviders = useMemo(
    () => [...providers].sort((a, b) => a.provider_id.localeCompare(b.provider_id)),
    [providers]
  )

  return (
    <div className="overflow-hidden border rounded-lg border-ui-border-base bg-ui-bg-base">
      <div className="px-6 py-4 border-b border-ui-border-base">
        <h2 className="text-lg font-medium text-ui-fg-base">
          Shipping Providers Control
        </h2>
        <p className="mt-1 text-sm text-ui-fg-subtle">
          Review all shipping providers, inspect options and prices, and
          activate/deactivate providers used at checkout.
        </p>
      </div>

      <div className="px-6 py-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadProviders()}
            disabled={loading}
            className="px-3 border rounded-md h-9 border-ui-border-base text-ui-fg-base hover:bg-ui-bg-subtle disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => void onSyncProviders()}
            disabled={syncingProviders}
            className="px-3 border rounded-md h-9 border-ui-border-base text-ui-fg-base hover:bg-ui-bg-subtle disabled:opacity-60"
          >
            {syncingProviders ? "Syncing..." : "Sync Providers To Stock"}
          </button>
        </div>

        {error ? (
          <div className="px-3 py-2 text-sm border rounded-md border-rose-300 bg-rose-50 text-rose-700">
            {error}
          </div>
        ) : null}

        {!loading && sortedProviders.length === 0 ? (
          <div className="px-3 py-2 text-sm border rounded-md border-ui-border-base text-ui-fg-subtle">
            No shipping providers were found.
          </div>
        ) : null}

        <div className="space-y-3">
          {sortedProviders.map((provider) => {
            const isSaving = savingProviderId === provider.provider_id

            return (
              <div
                key={provider.provider_id}
                className="p-4 border rounded-md border-ui-border-base"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-ui-fg-base">
                      {provider.label || provider.provider_id}
                    </h3>
                    <p className="text-xs text-ui-fg-subtle">ID: {provider.provider_id}</p>
                    <p className="text-xs text-ui-fg-subtle">
                      {provider.options.length} shipping option
                      {provider.options.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-md ${
                        provider.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-ui-bg-disabled text-ui-fg-muted"
                      }`}
                    >
                      {provider.active ? "Active" : "Inactive"}
                    </span>

                    <span
                      className={`px-2 py-1 text-xs rounded-md ${
                        provider.has_api_key
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {provider.has_api_key ? "API Key Added" : "API Key Missing"}
                    </span>

                    <button
                      type="button"
                      disabled={isSaving || (!provider.active && !provider.has_api_key)}
                      onClick={() =>
                        void onToggle(provider.provider_id, !provider.active)
                      }
                      className="h-8 px-3 text-xs border rounded-md border-ui-border-base text-ui-fg-base hover:bg-ui-bg-subtle disabled:opacity-60"
                    >
                      {isSaving
                        ? "Saving..."
                        : provider.active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 mt-3 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <label
                      htmlFor={`provider-api-key-${provider.provider_id}`}
                      className="text-xs font-medium text-ui-fg-subtle"
                    >
                      Provider API Key
                    </label>
                    <input
                      id={`provider-api-key-${provider.provider_id}`}
                      type="text"
                      value={apiKeyDraftByProvider[provider.provider_id] || ""}
                      onChange={(event) =>
                        setApiKeyDraftByProvider((prev) => ({
                          ...prev,
                          [provider.provider_id]: event.target.value,
                        }))
                      }
                      placeholder="Optional while creating options, required for activation"
                      className="w-full px-3 mt-1 text-sm border rounded-md h-9 border-ui-border-base bg-ui-bg-base text-ui-fg-base"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={savingApiKeyProviderId === provider.provider_id}
                    onClick={() => void onSaveApiKey(provider.provider_id)}
                    className="px-3 text-xs border rounded-md h-9 border-ui-border-base text-ui-fg-base hover:bg-ui-bg-subtle disabled:opacity-60"
                  >
                    {savingApiKeyProviderId === provider.provider_id
                      ? "Saving..."
                      : "Save API Key"}
                  </button>
                </div>

                {!provider.has_api_key ? (
                  <p className="mt-2 text-xs text-amber-700">
                    This provider cannot be activated until an API key is saved.
                  </p>
                ) : null}

                <div className="mt-3 space-y-2">
                  {provider.options.map((option) => (
                    <div
                      key={option.id}
                      className="p-3 border rounded-md border-ui-border-base/70"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-ui-fg-base">
                          {option.name}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-ui-bg-subtle text-ui-fg-subtle">
                          {option.price_type || "-"}
                        </span>
                        {option.type?.label ? (
                          <span className="px-2 py-1 text-xs rounded bg-ui-bg-subtle text-ui-fg-subtle">
                            {option.type.label}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-xs text-ui-fg-subtle">
                        Profile: {option.shipping_profile?.name || "-"} | Zone: {" "}
                        {option.service_zone?.name || "-"}
                      </p>

                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="text-left text-ui-fg-subtle">
                              <th className="py-1 pr-3 font-medium">Currency</th>
                              <th className="py-1 pr-3 font-medium">Amount</th>
                              <th className="py-1 pr-3 font-medium">Min Qty</th>
                              <th className="py-1 pr-3 font-medium">Max Qty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(option.prices || []).length === 0 ? (
                              <tr>
                                <td className="py-1 pr-3 text-ui-fg-muted" colSpan={4}>
                                  No flat prices configured.
                                </td>
                              </tr>
                            ) : (
                              (option.prices || []).map((price) => (
                                <tr key={price.id || `${option.id}-${price.currency_code}`}>
                                  <td className="py-1 pr-3 text-ui-fg-base">
                                    {(price.currency_code || "-").toUpperCase()}
                                  </td>
                                  <td className="py-1 pr-3 text-ui-fg-base">
                                    {moneyFormatter(price.amount, price.currency_code)}
                                  </td>
                                  <td className="py-1 pr-3 text-ui-fg-base">
                                    {price.min_quantity ?? "-"}
                                  </td>
                                  <td className="py-1 pr-3 text-ui-fg-base">
                                    {price.max_quantity ?? "-"}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "shipping_profile.list.before",
})

export default ShippingProvidersManagementWidget
