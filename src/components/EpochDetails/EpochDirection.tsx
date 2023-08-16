import styles from '../../styles/Epoch.module.css'
import { EEpochDisplayStatus } from '../EpochDisplay'

export type TEpochDirectionProps = {
  direction: number
  confidence: number
  delta: number | undefined
  status: EEpochDisplayStatus
}

export const EpochDirection: React.FC<TEpochDirectionProps> = ({
  direction,
  confidence,
  delta,
  status
}) => {
  const getDirectionText = (direction: number) => {
    return direction == 1 ? 'BULL' : 'BEAR'
  }
  return (
    <div className={styles.epochDirectionContainer}>
      <span>
        {status === EEpochDisplayStatus.NextPrediction
          ? `${parseFloat(confidence.toString()).toFixed(
              0
            )}% ${getDirectionText(direction)}`
          : `${delta && delta > 0 ? '+' : ''}${
              delta && delta !== 0
                ? parseFloat(delta?.toString()).toFixed(3)
                : 0
            }%`}
      </span>
    </div>
  )
}
