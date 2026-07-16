"use client"
import { RadioGroup } from "@headlessui/react"
import { isMoyasar, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import PaymentContainer from "@modules/checkout/components/payment-container"
import {
  Button,
  Container,
  Heading,
  Text,
  clx,
} from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )
  const [moyasarCardName, setMoyasarCardName] = useState("")
  const [moyasarCardNumber, setMoyasarCardNumber] = useState("")
  const [moyasarCardMonth, setMoyasarCardMonth] = useState("")
  const [moyasarCardYear, setMoyasarCardYear] = useState("")
  const [moyasarCardCvc, setMoyasarCardCvc] = useState("")
  const [moyasarSelection, setMoyasarSelection] = useState("visa_mastercard")

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const countryCode = pathname.split("/").filter(Boolean)[0] || ""

  const setPaymentMethod = (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
  }

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && cart?.total === 0
  )

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
  
    try {
      if (
        !moyasarCardName.trim() ||
        !moyasarCardNumber.trim() ||
        !moyasarCardMonth.trim() ||
        !moyasarCardYear.trim() ||
        !moyasarCardCvc.trim()
      ) {
        throw new Error("Please complete all Moyasar card fields")
      }
    
      await initiatePaymentSession(cart, {
        provider_id: selectedPaymentMethod,
        data: {
          payment_source_selection: moyasarSelection,
          card_name: moyasarCardName.trim(),
          card_number: moyasarCardNumber.replace(/\D/g, ""),
          card_month: moyasarCardMonth.replace(/\D/g, "").slice(0, 2),
          card_year: moyasarCardYear.replace(/\D/g, "").slice(0, 4),
          card_cvc: moyasarCardCvc.replace(/\D/g, "").slice(0, 4),
          metadata: {
            cart_id: cart.id,
          },
        },
      })
    
      router.push(
        pathname + "?" + createQueryString("step", "review"),
        {
          scroll: false,
        }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  // Note: Moyasar payment callback (status=paid/failed/etc) is now handled
  // server-side in the checkout page component. The client-side useEffect
  // that previously called placeOrder() has been removed because:
  // 1. The cart cookie may not be available after cross-site redirect
  // 2. The server component can use cart_id from the URL (passed by backend hook)
  // 3. Avoids race conditions between server and client handling

  
  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {availablePaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isMoyasar(paymentMethod.id) ? (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      >
                        {selectedPaymentMethod === paymentMethod.id && (
                          <div className="grid grid-cols-1 gap-3 my-4 small:grid-cols-2">
                            <div className="small:col-span-2">
                              <Text className="mb-1 txt-medium-plus text-ui-fg-base">
                                Card holder name
                              </Text>
                              <input
                                value={moyasarCardName}
                                onChange={(e) => setMoyasarCardName(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="w-full px-4 border rounded-md h-11"
                                placeholder="Name on card"
                                autoComplete="cc-name"
                              />
                            </div>
                            <div className="small:col-span-2">
                              <Text className="mb-1 txt-medium-plus text-ui-fg-base">
                                Card number
                              </Text>
                              <input
                                value={moyasarCardNumber}
                                onChange={(e) =>
                                  setMoyasarCardNumber(
                                    e.target.value.replace(/[^\d\s-]/g, "")
                                  )
                                }
                                onKeyDown={(e) => e.stopPropagation()}
                                className="w-full px-4 border rounded-md h-11"
                                placeholder="4111111111111111"
                                inputMode="numeric"
                                autoComplete="cc-number"
                              />
                            </div>
                            <div>
                              <Text className="mb-1 txt-medium-plus text-ui-fg-base">
                                Expiry month
                              </Text>
                              <input
                                value={moyasarCardMonth}
                                onChange={(e) =>
                                  setMoyasarCardMonth(
                                    e.target.value.replace(/\D/g, "").slice(0, 2)
                                  )
                                }
                                onKeyDown={(e) => e.stopPropagation()}
                                className="w-full px-4 border rounded-md h-11"
                                placeholder="MM"
                                inputMode="numeric"
                                autoComplete="cc-exp-month"
                              />
                            </div>
                            <div>
                              <Text className="mb-1 txt-medium-plus text-ui-fg-base">
                                Expiry year
                              </Text>
                              <input
                                value={moyasarCardYear}
                                onChange={(e) =>
                                  setMoyasarCardYear(
                                    e.target.value.replace(/\D/g, "").slice(0, 4)
                                  )
                                }
                                onKeyDown={(e) => e.stopPropagation()}
                                className="w-full px-4 border rounded-md h-11"
                                placeholder="YYYY"
                                inputMode="numeric"
                                autoComplete="cc-exp-year"
                              />
                            </div>
                            <div>
                              <Text className="mb-1 txt-medium-plus text-ui-fg-base">
                                CVC
                              </Text>
                              <input
                                value={moyasarCardCvc}
                                onChange={(e) =>
                                  setMoyasarCardCvc(
                                    e.target.value.replace(/\D/g, "").slice(0, 4)
                                  )
                                }
                                onKeyDown={(e) => e.stopPropagation()}
                                className="w-full px-4 border rounded-md h-11"
                                placeholder="123"
                                inputMode="numeric"
                                autoComplete="cc-csc"
                              />
                            </div>
                            <div>
                              <Text className="mb-1 txt-medium-plus text-ui-fg-base">
                                Card network
                              </Text>
                              <select
                                value={moyasarSelection}
                                onChange={(e) => setMoyasarSelection(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="w-full px-4 border rounded-md h-11"
                              >
                                <option value="visa_mastercard">Visa or Mastercard</option>
                                <option value="mada">Mada</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </PaymentContainer>
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="mb-1 txt-medium-plus text-ui-fg-base">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              !moyasarCardName ||
              !moyasarCardNumber ||
              !moyasarCardMonth ||
              !moyasarCardYear ||
              !moyasarCardCvc
            }
            data-testid="submit-payment-button"
          >
            Continue to review
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start w-full gap-x-1">
              <div className="flex flex-col w-1/3">
                <Text className="mb-1 txt-medium-plus text-ui-fg-base">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="mb-1 txt-medium-plus text-ui-fg-base">
                  Payment details
                </Text>
                <div
                  className="flex items-center gap-2 txt-medium text-ui-fg-subtle"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center p-2 h-7 w-fit bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    Visa / Mastercard / Mada
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="mb-1 txt-medium-plus text-ui-fg-base">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
