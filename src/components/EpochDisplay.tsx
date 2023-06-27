import { useSocketContext } from '@/contexts/SocketContext'
import styles from '../styles/Slot.module.css'
import { EpochBackground } from './EpochDetails/EpochBackground'
import { EpochDirection } from './EpochDetails/EpochDirection'

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
  const relatedData = epochData?.find(
    (data) => data.contractInfo.name === `${tokenName}-${pairName}`
  )

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
