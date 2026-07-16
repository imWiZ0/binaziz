"use client"

import { Fragment } from "react"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/common/components/ui"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

const SideMenu = () => {
  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="flex h-full">
          {({ open, close }) => (
            <>
              {open && (
                <div
                  className="pointer-events-auto fixed inset-0 z-[50] bg-black/0"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="absolute inset-x-0 z-[51] m-2 flex h-[calc(100vh-1rem)] w-full flex-col pr-4 text-sm text-ui-fg-on-color backdrop-blur-2xl sm:min-w-min sm:w-1/3 sm:pr-0 2xl:w-1/4">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex h-full flex-col justify-between rounded-rounded bg-[rgba(3,7,18,0.5)] p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button data-testid="close-menu-button" onClick={close}>
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col items-start justify-start gap-6">
                      {Object.entries(SideMenuItems).map(([name, href]) => (
                        <li key={name}>
                          <LocalizedClientLink
                            href={href}
                            className="text-3xl leading-10 hover:text-ui-fg-disabled"
                            onClick={close}
                            data-testid={`${name.toLowerCase()}-link`}
                          >
                            {name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                    <Text className="flex justify-between txt-compact-small">
                      © {new Date().getFullYear()} Medusa Store. All rights
                      reserved.
                    </Text>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
