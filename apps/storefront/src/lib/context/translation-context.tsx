"use client"

import {
  getDictionary,
  getDirection,
  LocaleCode,
  TranslationKey,
} from "@lib/i18n"
import React, { createContext, useCallback, useContext, useMemo } from "react"

interface TranslationContext {
  locale: LocaleCode
  dir: "ltr" | "rtl"
  t: (key: TranslationKey) => string
}

const TranslationContext = createContext<TranslationContext | null>(null)

interface TranslationProviderProps {
  children?: React.ReactNode
  locale: LocaleCode
}

export const TranslationProvider = ({
  children,
  locale,
}: TranslationProviderProps) => {
  const dictionary = getDictionary(locale)

  const t = useCallback(
    (key: TranslationKey) => dictionary[key] ?? key,
    [dictionary]
  )

  const value = useMemo(
    () => ({
      locale,
      dir: getDirection(locale),
      t,
    }),
    [locale, t]
  )

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (context === null) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
