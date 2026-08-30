import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Text } from "@medusajs/ui"
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
    <Container>
      <Heading level="h2">{t("location.oto_sync_widget.title")}</Heading>

      <Text className="mb-4" size="small">
        {t("location.oto_sync_widget.description")}
      </Text>
      <Text className="mb-4 text-ui-fg-subtle" size="xsmall">
        {t("location.oto_sync_widget.current_location", { name: data.name })}
      </Text>
      <Button onClick={handleSync} variant="secondary" size="small">
        {t("location.oto_sync_widget.sync_button")}
      </Button>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "location.details.side.after",
})

export default OtoSyncWidget