import { useSocketContext } from '@/contexts/SocketContext'
import { useMemo } from 'react'
import styles from '../styles/Slot.module.css'
import { EpochBackground } from './EpochDetails/EpochBackground'
import { EpochDirection } from './EpochDetails/EpochDirection'

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
}

export const EpochDisplay: React.FC<TEpochDisplayProps> = ({
  status,
  tokenName,
  pairName
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

  const relatedData = epochData
    ?.find((data) => data.contractInfo.name === `${tokenName}-${pairName}`)
    ?.predictions.sort((a, b) => a.epoch - b.epoch)[relatedPredictionIndex]

  if (!epochData || !relatedData) return null

  return (
    <div className={styles.container}>
      <EpochBackground direction={relatedData.dir} stake={relatedData.stake} />
      <EpochDirection
        direction={relatedData.dir}
        confidence={relatedData.confidence}
      />
    </div>
  )
}
