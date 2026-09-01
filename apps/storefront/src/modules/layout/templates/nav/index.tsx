import { Suspense } from "react"

import { getLocale } from "@lib/data/locale-actions"
import { getDictionary } from "@lib/i18n"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import LanguageSwitcher from "@modules/layout/components/language-switcher"
import SideMenu from "@modules/layout/components/side-menu"
import { ShoppingBag, User } from "lucide-react"

export default async function Nav() {
  const t = getDictionary(await getLocale())

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
            >
              Medusa Store
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <LanguageSwitcher />
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-ui-fg-base flex items-center h-full"
                href="/account"
                aria-label={t["nav.account"]}
                title={t["nav.account"]}
                data-testid="nav-account-link"
              >
                <User size={20} strokeWidth={1.5} />
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base relative flex items-center"
                  href="/cart"
                  aria-label={t["nav.cart"]}
                  title={t["nav.cart"]}
                  data-testid="nav-cart-link"
                >
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  <span className="absolute -top-2 -end-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ui-fg-base px-1 text-[10px] leading-none text-white">
                    0
                  </span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
