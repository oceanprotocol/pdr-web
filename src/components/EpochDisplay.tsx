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
import { EpochBackground } from './EpochDetails/EpochBackground'
import { EpochDirection } from './EpochDetails/EpochDirection'
import { EpochFooter } from './EpochDetails/EpochFooter'
import { SubscriptionStatus } from './Subscription'

//TODO: Fix Eslint
export enum EEpochDisplayStatus {
  'NextPrediction' = 'next',
  'LivePrediction' = 'live',
  'HistoricalPrediction' = 'history'
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
  const [delta, setDelta] = useState<number>()
  const [initialPrice, setInitialPrice] = useState<number>()

  const relatedPredictionIndex = useMemo(() => {
    switch (status) {
      case EEpochDisplayStatus.NextPrediction:
        return 3
      case EEpochDisplayStatus.LivePrediction:
        return 2
      case EEpochDisplayStatus.HistoricalPrediction:
        return historyIndex === 0 ? 0 : 1
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
      status !== EEpochDisplayStatus.LivePrediction ||
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
    const delta =
      (100 * (parseFloat(finalPrice) - parseFloat(initialPrice))) /
      ((parseFloat(finalPrice) + parseFloat(initialPrice)) / 2)
    setDelta(delta)
  }

  useEffect(() => {
    if (status !== EEpochDisplayStatus.HistoricalPrediction) return
    getHistoryEpochPriceDelta()
  }, [relatedData])

  return (
    <div className={styles.container}>
      {subsciption != SubscriptionStatus.INACTIVE &&
      epochData &&
      relatedData ? (
        <>
          <EpochBackground
            direction={relatedData.dir}
            stake={relatedData.stake}
            state={status}
            delta={delta}
          />
          {relatedData.stake ? (
            <>
              <EpochDirection
                direction={relatedData.dir}
                confidence={relatedData.confidence}
                delta={delta}
                status={status}
              />
              <EpochFooter
                stake={relatedData.stake}
                confidence={relatedData.confidence}
                direction={relatedData.dir}
                delta={delta}
                status={status}
              />
            </>
          ) : (
            'NO PRED'
          )}
          {status === EEpochDisplayStatus.NextPrediction && (
            <ProgressBar
              refreshOnData={relatedData.epochStartTs}
              progress={
                relatedData.epochStartTs -
                new Date().getTime() / 1000 -
                PREDICTION_FETCH_EPOCHS_DELAY
              }
              max={relatedData.secondsPerEpoch - PREDICTION_FETCH_EPOCHS_DELAY}
            />
          )}
        </>
      ) : (
        <span>??</span>
      )}
    </div>
  )
}
