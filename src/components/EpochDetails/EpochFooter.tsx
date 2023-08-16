import styles from '../../styles/Epoch.module.css'
import { EEpochDisplayStatus } from '../EpochDisplay'
import { EpochStakedTokens } from './EpochStakedTokens'

export type TEpochFooterProps = {
  direction: number
  confidence: number
  delta: number | undefined
  stake: number
  status: EEpochDisplayStatus
}

export const EpochFooter: React.FC<TEpochFooterProps> = ({
  direction,
  confidence,
  delta,
  stake,
  status
}) => {
  return (
    <>
      {status !== EEpochDisplayStatus.NextPrediction ? (
        <div
          className={styles.metricsFooter}
          style={{
            backgroundColor: `rgba(${
              direction !== 1 ? '102,207,0,1' : '220,20,60,1'
            })`
          }}
        >
          <span className={styles.footerConfidence}>
            {parseFloat(confidence.toString()).toFixed(0)}%
          </span>
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
