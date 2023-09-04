import styles from '../../styles/Epoch.module.css'
import { EEpochDisplayStatus } from '../EpochDisplay'
import { EpochStakedTokens } from './EpochStakedTokens'

export type TEpochPredictionProps = {
  direction: number | undefined
  stakedUp: number | undefined
  totalStaked: number | undefined
  status: EEpochDisplayStatus
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
        backgroundColor: `${
          direction == undefined || totalStaked == 0
            ? '#cbcbcb'
            : direction == 1
            ? '#BEFFC1'
            : '#FFB0B0'
        }`,
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
          {direction !== undefined ||
            (totalStaked == 0 && (
              <img
                className={styles.predictionArrow}
                src={`/assets/icons/${
                  direction == 1 ? 'arrowUp' : 'arrowDown'
                }Colored.png`}
              />
            ))}
        </>
      </div>
      {direction !== undefined && (
        <EpochStakedTokens stakedUp={stakedUp} totalStaked={totalStaked} />
      )}
    </div>
  )
}
