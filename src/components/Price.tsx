import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { getFromTheHistoricalPairsCache } from '@/contexts/MarketPriceContextHelpers'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useEffect, useRef, useState } from 'react'
import { TokenData } from '../utils/asset'
import { EpochPrice } from './EpochDetails/EpochPrice'

export default function Asset({
  assetData
}: {
  assetData: TokenData | undefined
}) {
  const [initialPrice, setInitialPrice] = useState<number>()
  const [delta, setDelta] = useState<number>()
  const { currentEpoch, secondsPerEpoch } = usePredictoorsContext()
  const { historicalPairsCache } = useMarketPriceContext()
  const lastSuccessfullGetRef = useRef<number>(0)

  useEffect(() => {
    if (
      !currentEpoch ||
      !secondsPerEpoch ||
      !assetData ||
      assetData.pair.length == 0
    )
      return

    const queryTimestamp = currentEpoch - secondsPerEpoch

    if (queryTimestamp === lastSuccessfullGetRef.current) return

    // we are getting the close price of the previous epoch
    const data = getFromTheHistoricalPairsCache({
      historicalPairsCache,
      pairSymbol: assetData.pair,
      timestamp: queryTimestamp
    })
    console.log('data', data)
    if (data) {
      lastSuccessfullGetRef.current = queryTimestamp
      const closePriceOfPrevEpoch = parseFloat(data[data.length - 1].close)
      setInitialPrice(closePriceOfPrevEpoch)
      setDelta(assetData.price - closePriceOfPrevEpoch)
    }
  }, [currentEpoch, historicalPairsCache, assetData, secondsPerEpoch])

  useEffect(() => {
    if (!assetData || !assetData.price || !initialPrice) return
    setDelta(assetData.price - initialPrice)
  }, [assetData, assetData?.price, initialPrice])

  if (!assetData) return null

  return <EpochPrice price={assetData.price} delta={delta} />
}
