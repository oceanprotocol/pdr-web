import { useSocketContext } from '@/contexts/SocketContext'
import ProgressBar from '@/elements/ProgressBar'
import { PREDICTION_FETCH_EPOCHS_DELAY } from '@/utils/appconstants'
import { getAssetPairPrice } from '@/utils/marketPrices'
import { useEffect, useMemo, useState } from 'react'
import styles from '../styles/Epoch.module.css'
import { EpochBackground } from './EpochDetails/EpochBackground'
import { EpochDirection } from './EpochDetails/EpochDirection'
import { EpochStakedTokens } from './EpochDetails/EpochStakedTokens'
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
  subsciption: SubscriptionStatus
}

export const EpochDisplay: React.FC<TEpochDisplayProps> = ({
  status,
  price,
  market,
  tokenName,
  pairName,
  subsciption
}) => {
  const { epochData } = useSocketContext()
  const [delta, setDelta] = useState<number>()

  useEffect(() => {
    if (status !== EEpochDisplayStatus.LivePrediction) return
    getAssetPairPrice({
      assetPair: pairName,
      timestamp: relatedData?.epochStartTs,
      market: market
    }).then((initialPrice) => {
      setDelta(parseFloat(initialPrice) - price)
    })
  }, [price])

  const relatedPredictionIndex = useMemo(() => {
    switch (status) {
      case EEpochDisplayStatus.NextPrediction:
        return 2
      case EEpochDisplayStatus.LivePrediction:
        return 1
      default:
        return 0
    }
  }, [status])

  const relatedData = Array.isArray(epochData)
    ? epochData
        ?.find((data) => data.contractInfo.name === `${tokenName}-${pairName}`)
        ?.predictions.sort((a, b) => a.epoch - b.epoch)[relatedPredictionIndex]
    : null

  return (
    <div className={styles.container}>
      {subsciption != SubscriptionStatus.INACTIVE &&
      epochData &&
      relatedData ? (
        <>
          <EpochBackground
            direction={relatedData.dir}
            stake={relatedData.stake}
            delta={delta}
          />
          {!relatedData.stake ? (
            <EpochDirection
              direction={relatedData.dir}
              confidence={relatedData.confidence}
              delta={delta}
              status={status}
            />
          ) : (
            'NO PRED'
          )}
          {status !== EEpochDisplayStatus.NextPrediction ? (
            <div
              className={styles.metricsFooter}
              style={{
                backgroundColor: `rgba(${
                  relatedData.dir !== 1 ? '102,207,0' : '220,20,60'
                }, ${relatedData.stake > 0 ? relatedData.stake / 5 + 0.5 : 1})`
              }}
            >
              <span className={styles.footerConfidence}>
                {relatedData.confidence}%
              </span>
              <EpochStakedTokens stakedAmount={relatedData.stake} />
            </div>
          ) : (
            <div style={{ marginBottom: '4px' }}>
              <EpochStakedTokens stakedAmount={relatedData.stake} />
            </div>
          )}
          {status === EEpochDisplayStatus.NextPrediction && (
            <ProgressBar
              refreshOnData={relatedData.epochStartTs}
              progress={
                relatedData.epochStartTs +
                relatedData.secondsPerEpoch -
                relatedData.currentTs
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
