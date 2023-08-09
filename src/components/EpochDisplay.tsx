import { useSocketContext } from '@/contexts/SocketContext'
import ProgressBar from '@/elements/ProgressBar'
import { PREDICTION_FETCH_EPOCHS_DELAY } from '@/utils/appconstants'
import { useMemo } from 'react'
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
  tokenName: string
  pairName: string
  subsciption: SubscriptionStatus
}

export const EpochDisplay: React.FC<TEpochDisplayProps> = ({
  status,
  tokenName,
  pairName,
  subsciption
}) => {
  const { epochData } = useSocketContext()

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
          />
          {relatedData.stake ? (
            <EpochDirection
              direction={relatedData.dir}
              confidence={relatedData.confidence}
            />
          ) : (
            'NO PRED'
          )}
          {status === EEpochDisplayStatus.NextPrediction && (
            <ProgressBar
              refreshOnData={relatedData.epochStartTsNumber}
              progress={
                relatedData.epochStartTsNumber +
                relatedData.secondsPerEpoch -
                relatedData.currentTs
              }
              max={relatedData.secondsPerEpoch - PREDICTION_FETCH_EPOCHS_DELAY}
            />
          )}
          <EpochStakedTokens stakedAmount={relatedData.stake} />
        </>
      ) : (
        <span>??</span>
      )}
    </div>
  )
}
