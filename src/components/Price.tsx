import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { getAssetPairPrice } from '@/utils/marketPrices'
import { useEffect, useState } from 'react'
import { TokenData } from '../utils/asset'
import { EpochPrice } from './EpochDetails/EpochPrice'

export default function Price({
  assetData
}: {
  assetData: TokenData | undefined
}) {
  const [initialPrice, setInitialPrice] = useState<number>(0)
  const { currentEpoch } = usePredictoorsContext()
  if (!assetData) return null

  useEffect(() => {
    if (!currentEpoch || assetData.pair.length == 0) return
    getAssetPairPrice({
      assetPair: assetData.pair,
      timestamp: currentEpoch,
      market: assetData.market
    }).then((price: string) => {
      setInitialPrice(parseFloat(price))
    })
  }, [currentEpoch])

  return (
    <EpochPrice
      price={assetData.price}
      delta={initialPrice ? assetData.price - initialPrice : undefined}
    />
  )
}
