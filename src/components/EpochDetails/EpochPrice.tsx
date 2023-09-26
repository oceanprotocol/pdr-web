import styles from '../../styles/Epoch.module.css'

export type TEpochPriceProps = {
  delta: number | undefined
  price: number
  isPriceLoading: boolean
}

export const EpochPrice: React.FC<TEpochPriceProps> = ({
  delta,
  price,
  isPriceLoading
}) => {
  return (
    <div className={styles.epochPriceContainer}>
      <span className={styles.price}>
        {isPriceLoading ? 'loading' : `$${price}`}
      </span>{' '}
      {delta == undefined ? (
        <img
          className={styles.arrow}
          src={`/assets/icons/refresh.png`}
          alt="refresh"
        ></img>
      ) : delta == 0 ? (
        ''
      ) : (
        <img
          className={styles.arrow}
          src={`/assets/icons/${
            delta && delta > 0 ? 'arrowUp' : 'arrowDown'
          }Colored.png`}
          alt="direction"
        ></img>
      )}
    </div>
  )
}
