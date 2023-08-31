import styles from '../../styles/Epoch.module.css'
import { EpochStakedTokens } from './EpochStakedTokens'

export type TEpochPredictionProps = {
  direction: number
  stakedUp: number
  totalStaked: number
}

export const EpochPrediction: React.FC<TEpochPredictionProps> = ({
  direction,
  stakedUp,
  totalStaked
}) => {
  return (
    <div
      className={styles.predictionContainer}
      style={{
        backgroundColor: `${direction == 1 ? '#BEFFC1' : '#FFB0B0'}`
      }}
    >
      <div className={styles.directionConainer}>
        <span className={styles.predictionText}>Pred</span>
        <img
          className={styles.predictionArrow}
          src={`/assets/icons/${
            direction == 1 ? 'arrpwUp' : 'arrowDown'
          }Colored.png`}
        />
      </div>
      <EpochStakedTokens stakedUp={stakedUp} totalStaked={totalStaked} />
    </div>
  )
}
