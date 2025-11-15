'use client'

import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { TPredictoorsContext } from '@/contexts/PredictoorsContext.types'
import { useUserContext } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useIsCorrectChain } from '@/hooks/useIsCorrectChain'
import { NonError, ValueOf, sleep } from '@/utils/utils'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export enum SubscriptionStatus {
  'INACTIVE' = 'inactive',
  'ACTIVE' = 'active',
  'FREE' = 'FREE'
}

export interface SubscriptionData {
  status: SubscriptionStatus
  secondsPerSubscription: number
  price: number
}

export type TSubscriptionProps = {
  subscriptionData: SubscriptionData | undefined
  contractAddress: string
}

type TContractPriceInfo = {
  price: NonError<NonNullable<ValueOf<TPredictoorsContext['contractPrices']>>>
  alternativeText?: string
}

export default function Subscription({
  subscriptionData,
  contractAddress
}: TSubscriptionProps) {
  const { isConnected, address } = useAccount()
  const { refetchBalance, isBuyingSubscription, setIsBuyingSubscription } =
    useUserContext()
  const signer = useEthersSigner({})
  const { isCorrectNetwork } = useIsCorrectChain()

  const { getPredictorInstanceByAddress, runCheckContracts, contractPrices } =
    usePredictoorsContext()

  const contractPriceInfo: TContractPriceInfo = useMemo(() => {
    const loadingResult = {
      price: subscriptionData?.price || 0,
      alternativeText: 'Loading...'
    }

    if (Object.keys(contractPrices).length === 0) return loadingResult

    const contractPrice = contractPrices[contractAddress]

    if (!contractPrice || contractPrice instanceof Error) return loadingResult

    return { price: contractPrice }
  }, [contractPrices, contractAddress, subscriptionData?.price])

  const BuyAction = useCallback<
    (args: { currentStatus: SubscriptionStatus }) => Promise<void>
  >(
    async ({ currentStatus }) => {
      if (
        !isConnected ||
        currentStatus !== SubscriptionStatus.INACTIVE ||
        !address
      )
        return

      try {
        const predictorInstance = getPredictorInstanceByAddress(contractAddress)

        if (!predictorInstance) return
        setIsBuyingSubscription(contractAddress)

        if (!signer) return
        const receipt = await predictorInstance.buyAndStartSubscription(signer)

        await sleep(1000)

        if (receipt) {
          runCheckContracts()
        }
        refetchBalance()
        setIsBuyingSubscription('')
        toast.success('Subscription purchase successful!')
      } catch (e: unknown) {
        const error = e as Error
        console.error(error)
        setIsBuyingSubscription('')
        toast.error('Subscription purchase failed!')
      }
    },
    [
      isConnected,
      address,
      getPredictorInstanceByAddress,
      contractAddress,
      setIsBuyingSubscription,
      signer,
      runCheckContracts,
      refetchBalance
    ]
  )

  if (!subscriptionData) return null

  const isLoading = isBuyingSubscription === contractAddress
  const isDisabled = !isConnected || isBuyingSubscription !== '' || !isCorrectNetwork

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      {contractPriceInfo.price > 0 ? (
        <>
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image
                    src="/ocean-token-logo.svg"
                    height={20}
                    width={20}
                    alt="Ocean token logo"
                    className="rounded-full cursor-help"
                  />
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">
                  OCEAN
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="font-semibold">{contractPriceInfo.price}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">
              {subscriptionData.secondsPerSubscription / 3600}h
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              BuyAction({ currentStatus: subscriptionData.status })
            }
            disabled={isDisabled}
          >
            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {isLoading ? 'Buying...' : 'Buy'}
          </Button>
        </>
      ) : (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
