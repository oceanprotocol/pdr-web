'use client'

import Image from 'next/image'
import { TokenData } from '../utils/asset'
import { SubscriptionStatus } from './Subscription'
import SubscriptionDot from './SubscriptionDot'

export enum Markets {
  'BINANCE' = 'binance',
  'KRAKEN' = 'kraken'
}

export default function Asset({
  assetData,
  contractAddress,
  subscription,
  secondsPerSubscription
}: {
  assetData: TokenData | undefined
  contractAddress: string
  subscription: SubscriptionStatus
  secondsPerSubscription: number
}) {
  if (!assetData) return null

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <SubscriptionDot
        status={subscription}
        assetName={assetData.name}
        contractAddress={contractAddress}
        secondsPerSubscription={secondsPerSubscription}
      />
      <Image
        className="h-8 w-8 rounded-full"
        src={`/assets/icons/${assetData.symbol}.svg`}
        alt="Coin symbol image"
        width={32}
        height={32}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">{assetData.name}</span>
        <div className="flex items-center gap-1">
          <Image
            src={
              assetData.market === Markets.BINANCE
                ? '/binance-logo.png'
                : '/kraken-logo.png'
            }
            alt="marketLogo"
            width={9}
            height={9}
          />
          <span className="text-xs text-muted-foreground">
            {assetData.market.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}
