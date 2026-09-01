"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { useTranslation } from "@lib/context/translation-context"
import { updateLocale } from "@lib/data/locale-actions"
import { LocaleCode, TranslationKey } from "@lib/i18n"
import { clx } from "@modules/common/components/ui"
import { Check, Languages } from "lucide-react"
import { useRouter } from "next/navigation"
import { Fragment, useTransition } from "react"

const LANGUAGE_OPTIONS: { code: LocaleCode; labelKey: TranslationKey }[] = [
  { code: "en", labelKey: "language.english" },
  { code: "ar", labelKey: "language.arabic" },
]

const LanguageSwitcher = () => {
  const { locale, t } = useTranslation()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSelect = (code: LocaleCode, close: () => void) => {
    close()

    if (code === locale) {
      return
    }

    startTransition(async () => {
      await updateLocale(code)
      router.refresh()
    })
  }

  return (
    <Popover className="relative flex items-center h-full">
      <PopoverButton
        className="flex items-center h-full hover:text-ui-fg-base transition-colors"
        aria-label={t("nav.language")}
        title={t("nav.language")}
        disabled={isPending}
        data-testid="nav-language-button"
      >
        <Languages size={20} strokeWidth={1.5} />
      </PopoverButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel
          className="absolute top-[calc(100%+8px)] end-0 z-50 w-40 rounded-rounded border border-gray-200 bg-white p-1 text-ui-fg-base shadow-lg"
          data-testid="nav-language-dropdown"
        >
          {({ close }) => (
            <div className="flex flex-col">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  onClick={() => handleSelect(option.code, close)}
                  className={clx(
                    "flex items-center justify-between gap-2 rounded-base px-3 py-2 text-left text-small-regular hover:bg-gray-100",
                    locale === option.code && "font-semibold"
                  )}
                  data-testid={`language-option-${option.code}`}
                >
                  <span>{t(option.labelKey)}</span>
                  {locale === option.code && (
                    <Check size={16} strokeWidth={2} className="shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  )
}

export default LanguageSwitcher
