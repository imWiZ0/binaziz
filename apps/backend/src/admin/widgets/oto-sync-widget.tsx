import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

const OtoSyncWidget = ({ data }: DetailWidgetProps<any>) => {
  const { t } = useTranslation("translation")
  const handleSync = async () => {
    await fetch("/admin/oto/sync-location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stock_location_id: data.id,
      }),
    })
  }

  return (
    <div>
      <Heading level="h2">{t("location.oto_sync_widget.title")}</Heading>

      <p className="mb-4 text-sm">
        {t("location.oto_sync_widget.description")}
      </p>
      <p className="mb-4 text-xs text-ui-fg-subtle">
        {t("location.oto_sync_widget.current_location", { name: data.name })}
      </p>
      <button
        type="button"
        onClick={handleSync}
        className="rounded-md border px-3 py-1.5 text-sm"
      >
        {t("location.oto_sync_widget.sync_button")}
      </button>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "location.details.side.after",
})

export default OtoSyncWidget