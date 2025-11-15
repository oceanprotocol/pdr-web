'use client'

import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { getRelatedPair } from '@/contexts/MarketPriceContextHelpers'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useSocketContext } from '@/contexts/SocketContext'
import { useEffect, useMemo } from 'react'
import { EpochPrediction } from './EpochDetails/EpochPrediction'
import { EpochPrice } from './EpochDetails/EpochPrice'
import { EpochStakedTokens } from './EpochDetails/EpochStakedTokens'
import { SubscriptionStatus } from './Subscription'

export enum EEpochDisplayStatus {
  'NextEpoch' = 'next',
  'LiveEpoch' = 'live',
  'PastEpoch' = 'history'
}

type RelatedData = {
  nom?: string
  denom?: string
  dir?: number
  epoch?: number
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
  address,
  tokenName,
  pairName,
  subscription,
  epochStartTs,
  secondsPerEpoch
}) => {
  const { epochData } = useSocketContext()
  const { fetchingPredictions } = usePredictoorsContext()
  const { fetchHistoricalPair, historicalPairsCache, isPriceLoading } = useMarketPriceContext()

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

  // Calculate finalPrice and delta using useMemo instead of useState + useEffect
  const { finalPrice, delta } = useMemo(() => {
    const initialPrice = getRelatedPair({
      pairSymbol: tokenName + pairName,
      cacheTimestamp:
        epochStartTs - (relatedPredictionIndex + 2) * secondsPerEpoch,
      historicalPairsCache,
      epochStartTs: epochStartTs - 2 * secondsPerEpoch
    })?.close
    const finalPriceData = getRelatedPair({
      pairSymbol: tokenName + pairName,
      cacheTimestamp:
        epochStartTs - (relatedPredictionIndex + 2) * secondsPerEpoch,
      historicalPairsCache,
      epochStartTs: epochStartTs - secondsPerEpoch
    })?.close

    if (!initialPrice || !finalPriceData) {
      return { finalPrice: 0, delta: undefined }
    }

    const finalPriceValue = parseFloat(finalPriceData)
    const calculatedDelta =
      (100 * (finalPriceValue - parseFloat(initialPrice))) /
      ((finalPriceValue + parseFloat(initialPrice)) / 2)

    return {
      finalPrice: finalPriceValue,
      delta: calculatedDelta
    }
  }, [
    historicalPairsCache,
    tokenName,
    pairName,
    epochStartTs,
    relatedPredictionIndex,
    secondsPerEpoch
  ])

  // Calculate relatedData using useMemo instead of useState + useEffect
  const relatedData = useMemo<RelatedData | null>(() => {
    if (!Array.isArray(epochData)) {
      return null
    }

    const foundData = epochData
      ?.find((data) => data.contractInfo?.address === address)
      ?.predictions.sort((a, b) => a.epoch - b.epoch)[relatedPredictionIndex]

    return foundData || null
  }, [epochData, address, relatedPredictionIndex])

  // Keep this useEffect for the side effect (fetching historical data)
  useEffect(() => {
    if (isNextEpoch || !secondsPerEpoch || !epochStartTs) return
    if (status !== EEpochDisplayStatus.PastEpoch) return

    fetchHistoricalPair(
      tokenName + pairName,
      epochStartTs - 2 * secondsPerEpoch
    )
  }, [relatedData, secondsPerEpoch, epochStartTs, isNextEpoch, status, tokenName, pairName, fetchHistoricalPair])

  return (
    <div className="flex flex-col gap-1 px-2 py-1">
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
              relatedData?.nom ? parseFloat(relatedData.nom) : undefined
            }
            totalStaked={
              relatedData?.denom ? parseFloat(relatedData.denom) : undefined
            }
            direction={relatedData?.dir}
            showLabel
          />
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ) : null}
      {subscription !== SubscriptionStatus.INACTIVE && (
        <EpochPrediction
          stakedUp={relatedData?.nom ? parseFloat(relatedData.nom) : undefined}
          totalStaked={
            relatedData?.denom ? parseFloat(relatedData.denom) : undefined
          }
          loading={!relatedData || fetchingPredictions}
          direction={relatedData?.dir}
        />
      )}
    </div>
  )
}
