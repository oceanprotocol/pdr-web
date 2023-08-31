import styles from '../../styles/Epoch.module.css'
import { EEpochDisplayStatus } from '../EpochDisplay'

export type TEpochPriceProps = {
  delta: number | undefined
  price: number
  status: EEpochDisplayStatus
}

export const EpochPrice: React.FC<TEpochPriceProps> = ({
  delta,
  price,
  status
}) => {
  return (
    <div className={styles.epochPriceContainer}>
      <span className={styles.price}>{`$${price}`}</span>{' '}
      {
        <img
          className={styles.arrow}
          src={`/assets/icons/${
            delta && delta > 0 ? 'arrowUp' : 'arrowDown'
          }Colored.png`}
          alt="direction"
        ></img>
      }
    </div>
  )
}
