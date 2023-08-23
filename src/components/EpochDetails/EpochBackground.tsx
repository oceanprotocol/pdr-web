import styles from '@/styles/Epoch.module.css'
import { EEpochDisplayStatus } from '../EpochDisplay'

export type TEpochBackgroundProps = {
  direction: number
  stake: number
  state: EEpochDisplayStatus
  delta: number | undefined
}

export const EpochBackground: React.FC<TEpochBackgroundProps> = ({
  direction,
  stake,
  delta,
  state
}) => {
  return (
    <div
      className={styles.confidence}
      style={
        stake > 0
          ? delta
            ? delta == 0
              ? undefined
              : {
                  backgroundColor: `rgba(${
                    delta > 0 ? '102,207,0' : '220,20,60'
                  }, ${stake > 0 ? stake / 5 + 0.5 : 0})`
                }
            : state != EEpochDisplayStatus.NextPrediction
            ? undefined
            : {
                backgroundColor: `rgba(${
                  direction == 1 ? '102,207,0' : '220,20,60'
                }, ${stake > 0 ? stake / 5 + 0.5 : 0})`
              }
          : undefined
      }
    ></div>
  )
}
