import { useSocketContext } from '@/contexts/SocketContext'
import { getAssetPairPrice } from '@/utils/marketPrices'
import { useEffect, useState } from 'react'
import { TokenData } from '../utils/asset'
import { EpochPrice } from './EpochDetails/EpochPrice'

export default function Asset({
  assetData
}: {
  assetData: TokenData | undefined
}) {
  const [initialPrice, setInitialPrice] = useState<number>(0)
  const { epochData } = useSocketContext()
  if (!assetData) return null

  useEffect(() => {
    if (!epochData) return
    getAssetPairPrice({
      assetPair: assetData.pair,
      timestamp: epochData[1].predictions[1].epochStartTs,
      market: assetData.market
    }).then((price: string) => {
      setInitialPrice(parseFloat(price))
    })
  }, [epochData])

  return (
    <EpochPrice
      price={assetData.price}
      delta={initialPrice ? assetData.price - initialPrice : undefined}
    />
  )
}
