'use client'

import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { getRelatedPair } from '@/contexts/MarketPriceContextHelpers'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useMemo } from 'react'
import { TokenData } from '../utils/asset'
import { EpochPrice } from './EpochDetails/EpochPrice'

export default function Price({
  assetData
}: {
  assetData: TokenData | undefined
}) {
  const { currentEpoch, secondsPerEpoch } = usePredictoorsContext()
  const { historicalPairsCache, isPriceLoading } = useMarketPriceContext()

  // Calculate initial price and delta using useMemo instead of useEffect + useState
  const { initialPrice, delta } = useMemo(() => {
    if (
      !currentEpoch ||
      !secondsPerEpoch ||
      !assetData ||
      assetData.pair.length === 0
    ) {
      return { initialPrice: undefined, delta: undefined }
    }

    const data = getRelatedPair({
      pairSymbol: assetData.pair,
      cacheTimestamp: currentEpoch - 3 * secondsPerEpoch,
      historicalPairsCache,
      epochStartTs: currentEpoch - secondsPerEpoch
    })

    if (!data) {
      return { initialPrice: undefined, delta: undefined }
    }

    const closePriceOfPrevEpoch = parseFloat(data.close)
    const calculatedDelta = assetData.price - closePriceOfPrevEpoch

    return {
      initialPrice: closePriceOfPrevEpoch,
      delta: calculatedDelta
    }
  }, [currentEpoch, secondsPerEpoch, assetData, historicalPairsCache])

  if (!assetData) return null

  return (
    <EpochPrice
      price={assetData.price}
      delta={delta}
      isPriceLoading={isPriceLoading}
    />
  )
}
