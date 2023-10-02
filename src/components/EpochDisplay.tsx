import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { getRelatedPair } from '@/contexts/MarketPriceContextHelpers'
import { useSocketContext } from '@/contexts/SocketContext'
import { useEffect, useMemo, useState } from 'react'
import styles from '../styles/Epoch.module.css'
import { EpochPrediction } from './EpochDetails/EpochPrediction'
import { EpochPrice } from './EpochDetails/EpochPrice'
import { EpochStakedTokens } from './EpochDetails/EpochStakedTokens'
import { SubscriptionStatus } from './Subscription'

//TODO: Fix Eslint
export enum EEpochDisplayStatus {
  'NextEpoch' = 'next',
  'LiveEpoch' = 'live',
  'PastEpoch' = 'history'
}

export type TEpochDisplayProps = {
  status: EEpochDisplayStatus
  price: number
  address: string
  tokenName: string
  pairName: string
  subscription: SubscriptionStatus
  epochStartTs: number
  secondsPerEpoch: number
}

export const EpochDisplay: React.FC<TEpochDisplayProps> = ({
  status,
  price,
  address,
  tokenName,
  pairName,
  subscription,
  epochStartTs,
  secondsPerEpoch
}) => {
  const { epochData } = useSocketContext()
  const [relatedData, setRelatedData] = useState<any>()
  const [delta, setDelta] = useState<number>()
<<<<<<< HEAD
  //const [initialPrice, setInitialPrice] = useState<number>()
=======
>>>>>>> e4a97358d1061f95c5908b30c393b78afd9d2ce3
  const [finalPrice, setFinalPrice] = useState<number>(0)
  const { fetchHistoricalPair, historicalPairsCache } = useMarketPriceContext()
  const { isPriceLoading } = useMarketPriceContext()

  const isNextEpoch = useMemo<boolean>(
    () => status === EEpochDisplayStatus.NextEpoch,
    [status]
  )

  const relatedPredictionIndex = useMemo(() => {
    switch (status) {
      case EEpochDisplayStatus.NextEpoch:
        return 2
      case EEpochDisplayStatus.LiveEpoch:
        return 1
      case EEpochDisplayStatus.PastEpoch:
        return 0
    }
  }, [status])

  const getHistoryEpochPriceDelta = async () => {
    if (status !== EEpochDisplayStatus.PastEpoch) return

    await fetchHistoricalPair(
      tokenName + pairName,
      epochStartTs - 2 * secondsPerEpoch
    )
  }

  useEffect(() => {
    const initialPrice = getRelatedPair({
      pairSymbol: tokenName + pairName,
      cacheTimestamp:
        epochStartTs - (relatedPredictionIndex + 2) * secondsPerEpoch,
      historicalPairsCache,
      epochStartTs: epochStartTs - 2 * secondsPerEpoch
    })?.close
    const finalPrice = getRelatedPair({
      pairSymbol: tokenName + pairName,
      cacheTimestamp:
        epochStartTs - (relatedPredictionIndex + 2) * secondsPerEpoch,
      historicalPairsCache,
      epochStartTs: epochStartTs - secondsPerEpoch
    })?.close
    if (!initialPrice || !finalPrice) return

    setFinalPrice(parseFloat(finalPrice))
    const delta =
      (100 * (parseFloat(finalPrice) - parseFloat(initialPrice))) /
      ((parseFloat(finalPrice) + parseFloat(initialPrice)) / 2)
    setDelta(delta)
  }, [
    historicalPairsCache,
    tokenName,
    pairName,
    epochStartTs,
    price,
    relatedPredictionIndex
  ])

  useEffect(() => {
    setRelatedData(
      Array.isArray(epochData)
        ? epochData
            ?.find((data) => data.contractInfo.address == address)
            ?.predictions.sort((a, b) => a.epoch - b.epoch)[
            relatedPredictionIndex
          ]
        : null
    )
  }, [epochData])

  useEffect(() => {
    if (isNextEpoch || !secondsPerEpoch || !epochStartTs) return
    getHistoryEpochPriceDelta()
  }, [relatedData, secondsPerEpoch, epochStartTs, isNextEpoch])

  return (
    <div className={styles.container}>
      {status !== EEpochDisplayStatus.NextEpoch && (
        <EpochPrice
          price={finalPrice}
          delta={delta}
          isPriceLoading={isPriceLoading}
        />
      )}
      {status === EEpochDisplayStatus.NextEpoch ? (
        subscription !== SubscriptionStatus.INACTIVE ? (
          <EpochStakedTokens
            stakedUp={
              relatedData?.nom ? parseFloat(relatedData?.nom) : undefined
            }
            totalStaked={
              relatedData?.denom ? parseFloat(relatedData?.denom) : undefined
            }
            direction={relatedData?.dir}
            showLabel
          />
        ) : (
          '-'
        )
      ) : (
        ''
      )}
      {subscription !== SubscriptionStatus.INACTIVE && (
        <EpochPrediction
          stakedUp={relatedData?.nom ? parseFloat(relatedData?.nom) : undefined}
          totalStaked={
            relatedData?.nom ? parseFloat(relatedData?.denom) : undefined
          }
          loading={!relatedData}
          direction={relatedData?.dir}
        />
      )}
    </div>
  )
}
