import { ClipLoader } from 'react-spinners'
import styles from '../../styles/Epoch.module.css'
import { EpochStakedTokens } from './EpochStakedTokens'

export type TEpochPredictionProps = {
  direction: number | undefined
  stakedUp: number | undefined
  totalStaked: number | undefined
  loading: boolean
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
  loading
}) => {
  return (
    <div
      className={styles.predictionContainer}
      style={{
        justifyContent: direction == undefined || loading ? 'center' : ''
      }}
    >
      <div className={styles.directionConainer}>
        <>
          <span className={styles.predictionText}>{`Pred${
            (direction == undefined || totalStaked == 0) && !loading ? '?' : ''
          }`}</span>
          {loading && (
            <ClipLoader
              size={8}
              color="var(--dark-grey)"
              loading={true}
              className={styles.loader}
            />
          )}
          {direction !== undefined && totalStaked != 0 && !loading && (
            <img
              className={styles.predictionArrow}
              src={`/assets/icons/${
                direction == 1 ? `arrowUp` : 'arrowDown'
              }Colored.png`}
            />
          )}
        </>
      </div>

      {direction !== undefined && !loading && (
        <EpochStakedTokens stakedUp={stakedUp} totalStaked={totalStaked} />
      )}
    </div>
  )
}
