'use client'

import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useUserContext } from '@/contexts/UserContext'
import { calculateTimeRemaining } from './elements/CountdownComponent'
import { ethers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { SubscriptionStatus } from './Subscription'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface SubscriptionData {
  status: SubscriptionStatus
  assetName: string
  contractAddress: string
  secondsPerSubscription: number
}

export default function SubscriptionDot({
  status,
  contractAddress,
  secondsPerSubscription
}: SubscriptionData) {
  const { address } = useAccount()

  const { getPredictorInstanceByAddress, contractPrices } =
    usePredictoorsContext()
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | undefined>()
  const { isBuyingSubscription } = useUserContext()

  // This useEffect is legitimate - it's fetching external data (async side effect)
  useEffect(() => {
    if (!address || !contractPrices) return

    let isMounted = true
    const predictorInstance = getPredictorInstanceByAddress(contractAddress)

    predictorInstance?.getSubscriptions(address).then((resp) => {
      // Only update state if component is still mounted
      if (resp && isMounted) {
        setExpiryTimestamp(parseInt(ethers.utils.formatUnits(resp.expires, 0)))
      }
    }).catch((error) => {
      console.error('Error fetching subscription:', error)
    })

    return () => {
      isMounted = false
    }
  }, [address, contractPrices, status, contractAddress, getPredictorInstanceByAddress])

  // Calculate tooltip message and expiry status using useMemo
  const { message, closeToExpiry } = useMemo(() => {
    const timeRemaining = expiryTimestamp
      ? calculateTimeRemaining(expiryTimestamp)
      : 0
    const seconds = Math.floor(timeRemaining / 1000)
    const minutes = Math.floor((timeRemaining / 1000 / 60) % 60)
    const hours = Math.floor((timeRemaining / 1000 / 3600) % 24)

    const isExpiring = seconds < secondsPerSubscription * 0.1

    let msg = ''
    switch (status) {
      case SubscriptionStatus.FREE:
        msg = 'Free Subscription'
        break
      case SubscriptionStatus.ACTIVE:
        msg = `Subscribed\n${hours}h ${minutes}min left${
          isExpiring ? ' (<10%)' : ''
        }`
        break
    }

    return { message: msg, closeToExpiry: isExpiring }
  }, [expiryTimestamp, status, secondsPerSubscription])

  const dotColorClass = useMemo(() => {
    if (isBuyingSubscription === contractAddress || status === SubscriptionStatus.INACTIVE) {
      return 'bg-white'
    }
    if (status === SubscriptionStatus.ACTIVE && closeToExpiry) {
      return 'bg-orange-500'
    }
    return 'bg-green-500'
  }, [isBuyingSubscription, status, closeToExpiry, contractAddress])

  if (status === SubscriptionStatus.INACTIVE && !isBuyingSubscription) {
    return null
  }

  const isLoading = isBuyingSubscription === contractAddress

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          ) : (
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                dotColorClass,
                'transition-colors duration-200'
              )}
            />
          )}
        </div>
      </TooltipTrigger>
      {message && (
        <TooltipContent>
          <p className="text-center whitespace-pre-line">{message}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}
