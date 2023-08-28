import styles from '../../styles/Epoch.module.css'
import { EEpochDisplayStatus } from '../EpochDisplay'
import { EpochStakedTokens } from './EpochStakedTokens'

export type TEpochFooterProps = {
  direction: number
  confidence: number
  stake: number
  delta: number | undefined
  status: EEpochDisplayStatus
}

export const EpochFooter: React.FC<TEpochFooterProps> = ({
  direction,
  confidence,
  stake,
  delta,
  status
}) => {
  return (
    <>
      {status !== EEpochDisplayStatus.NextPrediction ? (
        <div
          className={styles.metricsFooter}
          style={{
            backgroundColor: `rgb(${direction == 1 ? '102,207,0' : '220,20,60'}`
          }}
        >
          <span className={styles.footerConfidence}>
            {parseFloat(confidence.toString()).toFixed(0)}%
          </span>
          {delta &&
          ((direction == 1 && delta > 0.0) ||
            (direction == 0 && delta < 0.0)) ? (
            <div className={styles.eyesContainer}>
              <div className={styles.eye}></div>
              <div className={styles.eye}></div>
            </div>
          ) : (
            ''
          )}
          <EpochStakedTokens stakedAmount={stake} />
        </div>
      ) : (
        <div style={{ marginBottom: '4px' }}>
          <EpochStakedTokens stakedAmount={stake} showLabel />
        </div>
      )}
    </>
  )
}
