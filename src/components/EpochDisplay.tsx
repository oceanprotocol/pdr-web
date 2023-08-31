import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useSocketContext } from '@/contexts/SocketContext'
import ProgressBar from '@/elements/ProgressBar'
import { PREDICTION_FETCH_EPOCHS_DELAY } from '@/utils/appconstants'
import { getAssetPairPrice } from '@/utils/marketPrices'
import {
  compareSplittedNames,
  splitContractName
} from '@/utils/splitContractName'
import { useEffect, useMemo, useState } from 'react'
import styles from '../styles/Epoch.module.css'
import { EpochPrediction } from './EpochDetails/EpochPrediction'
import { EpochPrice } from './EpochDetails/EpochPrice'
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
  market: string
  tokenName: string
  pairName: string
  historyIndex?: number
  subsciption: SubscriptionStatus
}

export const EpochDisplay: React.FC<TEpochDisplayProps> = ({
  status,
  price,
  market,
  tokenName,
  pairName,
  historyIndex,
  subsciption
}) => {
  const { epochData } = useSocketContext()
  const { currentChainTime } = usePredictoorsContext()
  const [delta, setDelta] = useState<number>()
  const [initialPrice, setInitialPrice] = useState<number>()
  const [finalPrice, setFinalPrice] = useState<number>(0)

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

  const relatedData = Array.isArray(epochData)
    ? epochData
        ?.find((data) =>
          compareSplittedNames(splitContractName(data.contractInfo.name), [
            tokenName,
            pairName
          ])
        )
        ?.predictions.sort((a, b) => a.epoch - b.epoch)[relatedPredictionIndex]
    : null

  useEffect(() => {
    if (
      status !== EEpochDisplayStatus.LiveEpoch ||
      !relatedData ||
      relatedData.stake == 0
    )
      return
    if (!initialPrice) {
      getAssetPairPrice({
        assetPair: tokenName + pairName,
        timestamp: relatedData?.epochStartTs,
        market: market
      }).then((p) => {
        setInitialPrice(parseFloat(p))
        setDelta(parseFloat(p) - price)
      })
    } else {
      setDelta((100 * (price - initialPrice)) / ((price + initialPrice) / 2))
    }
  }, [price])

  const getHistoryEpochPriceDelta = async () => {
    if (!relatedData) return
    const [initialPrice, finalPrice] = await Promise.all([
      getAssetPairPrice({
        assetPair: tokenName + pairName,
        timestamp: relatedData?.epochStartTs,
        market: market
      }),
      getAssetPairPrice({
        assetPair: tokenName + pairName,
        timestamp: relatedData?.epochStartTs + relatedData?.secondsPerEpoch,
        market: market
      })
    ])
    setFinalPrice(parseFloat(finalPrice))
    const delta =
      (100 * (parseFloat(finalPrice) - parseFloat(initialPrice))) /
      ((parseFloat(finalPrice) + parseFloat(initialPrice)) / 2)
    setDelta(delta)
  }

  useEffect(() => {
    if (status !== EEpochDisplayStatus.NextEpoch) return
    getHistoryEpochPriceDelta()
  }, [relatedData])

  return (
    <div className={styles.container}>
      {subsciption != SubscriptionStatus.INACTIVE &&
      epochData &&
      relatedData ? (
        <>
          <>
            <EpochPrice price={finalPrice} delta={delta} status={status} />
            <EpochPrediction
              stake={relatedData.stake}
              confidence={relatedData.confidence}
              direction={relatedData.dir}
              delta={delta}
              status={status}
            />
          </>
          {status === EEpochDisplayStatus.NextEpoch && (
            <ProgressBar
              refreshOnData={relatedData.epochStartTs}
              progress={
                relatedData.epochStartTs -
                (currentChainTime > 0
                  ? currentChainTime
                  : relatedData.currentTs) -
                PREDICTION_FETCH_EPOCHS_DELAY
              }
              max={relatedData.secondsPerEpoch - PREDICTION_FETCH_EPOCHS_DELAY}
            />
          )}
        </>
      ) : (
        <span>Loading...</span>
      )}
    </div>
  )
}
