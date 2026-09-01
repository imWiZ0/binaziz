export const LOCALES = ["en", "ar"] as const

export type LocaleCode = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: LocaleCode = "ar"

const en = {
  // Header / navigation
  "nav.home": "Home",
  "nav.store": "Store",
  "nav.account": "Account",
  "nav.cart": "Cart",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.language": "Change language",
  "nav.rights": "All rights reserved.",

  // Language switcher
  "language.english": "English",
  "language.arabic": "العربية",

  // Cart dropdown
  "cart.title": "Cart",
  "cart.quantity": "Quantity",
  "cart.subtotal": "Subtotal",
  "cart.exclTaxes": "(excl. taxes)",
  "cart.goToCart": "Go to cart",
  "cart.empty": "Your shopping bag is empty.",
  "cart.explore": "Explore products",
  "cart.remove": "Remove",
}

export type TranslationKey = keyof typeof en

const ar: Record<TranslationKey, string> = {
  // Header / navigation
  "nav.home": "الرئيسية",
  "nav.store": "المتجر",
  "nav.account": "الحساب",
  "nav.cart": "السلة",
  "nav.openMenu": "فتح القائمة",
  "nav.closeMenu": "إغلاق القائمة",
  "nav.language": "تغيير اللغة",
  "nav.rights": "جميع الحقوق محفوظة.",

  // Language switcher
  "language.english": "English",
  "language.arabic": "العربية",

  // Cart dropdown
  "cart.title": "سلة التسوق",
  "cart.quantity": "الكمية",
  "cart.subtotal": "المجموع الفرعي",
  "cart.exclTaxes": "(غير شامل الضرائب)",
  "cart.goToCart": "الانتقال إلى السلة",
  "cart.empty": "سلة التسوق فارغة.",
  "cart.explore": "تصفح المنتجات",
  "cart.remove": "إزالة",
}

const dictionaries: Record<LocaleCode, Record<TranslationKey, string>> = {
  en,
  ar,
}

export const isLocale = (
  locale: string | null | undefined
): locale is LocaleCode =>
  !!locale && (LOCALES as readonly string[]).includes(locale)

export const normalizeLocale = (
  locale: string | null | undefined
): LocaleCode => {
  if (isLocale(locale)) {
    return locale
  }

  const base = locale?.split("-")[0]
  if (isLocale(base)) {
    return base
  }

  return DEFAULT_LOCALE
}

export const getDictionary = (
  locale: string | null | undefined
): Record<TranslationKey, string> => dictionaries[normalizeLocale(locale)]

export const getDirection = (
  locale: string | null | undefined
): "ltr" | "rtl" => (normalizeLocale(locale) === "ar" ? "rtl" : "ltr")
