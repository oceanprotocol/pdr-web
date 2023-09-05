import styles from '../../styles/Epoch.module.css'
import { EEpochDisplayStatus } from '../EpochDisplay'
import { EpochStakedTokens } from './EpochStakedTokens'

export type TEpochPredictionProps = {
  direction: number | undefined
  stakedUp: number | undefined
  totalStaked: number | undefined
  status: EEpochDisplayStatus
}

export const getPredictionBackgroundColor = (
  direction: number | undefined,
  totalStaked: number | undefined
) => {
  return `${
    direction == undefined || totalStaked == 0
      ? 'var(--prediction-background-green)'
      : direction === 1
      ? 'var(--prediction-background-grey)'
      : 'var(--prediction-background-red)'
  }`
}

export const EpochPrediction: React.FC<TEpochPredictionProps> = ({
  direction,
  stakedUp,
  totalStaked,
  status
}) => {
  return (
    <div
      className={styles.predictionContainer}
      style={{
        backgroundColor: getPredictionBackgroundColor(direction, totalStaked),
        justifyContent: direction == undefined ? 'center' : '',
        boxShadow:
          status === EEpochDisplayStatus.NextEpoch
            ? ''
            : '0px 0px 3px 1px var(--dark-grey)'
      }}
    >
      <div className={styles.directionConainer}>
        <>
          <span className={styles.predictionText}>{`Pred${
            direction == undefined || totalStaked == 0 ? '?' : ''
          }`}</span>
          {(direction !== undefined || totalStaked == 0) && (
            <img
              className={styles.predictionArrow}
              src={`/assets/icons/${
                direction == 1 ? 'arrowUp' : 'arrowDown'
              }Colored.png`}
            />
          )}
        </>
      </div>
      {direction !== undefined && (
        <EpochStakedTokens stakedUp={stakedUp} totalStaked={totalStaked} />
      )}
    </div>
  )
}
