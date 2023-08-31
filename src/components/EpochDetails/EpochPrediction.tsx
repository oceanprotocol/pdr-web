import styles from '../../styles/Epoch.module.css'
import { EpochStakedTokens } from './EpochStakedTokens'

export type TEpochPredictionProps = {
  direction: number | undefined
  stakedUp: number | undefined
  totalStaked: number | undefined
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
        backgroundColor: `${
          direction == undefined
            ? '#727272'
            : direction == 1
            ? '#BEFFC1'
            : '#FFB0B0'
        }`,
        justifyContent: direction == undefined ? 'center' : ''
      }}
    >
      <div className={styles.directionConainer}>
        <>
          <span className={styles.predictionText}>{`Pred${
            direction ? '' : ' ?'
          }`}</span>
          {direction !== undefined && (
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
