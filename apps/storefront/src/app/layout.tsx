import { TranslationProvider } from "@lib/context/translation-context"
import { getLocale } from "@lib/data/locale-actions"
import { getDirection, normalizeLocale } from "@lib/i18n"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "../styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = normalizeLocale(await getLocale())

  return (
    <html lang={locale} dir={getDirection(locale)} data-mode="light">
      <body>
        <TranslationProvider locale={locale}>
          <main className="relative">{props.children}</main>
        </TranslationProvider>
      </body>
    </html>
  )
}
