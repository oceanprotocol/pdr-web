import ClipLoader from 'react-spinners/ClipLoader'
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
      $
      {isPriceLoading ? (
        <ClipLoader size={12} color="var(--dark-grey)" loading={true} />
      ) : (
        <>
          <span className={styles.price}>{`${price}`}</span>{' '}
          {delta == undefined ? (
            <ClipLoader size={12} color="var(--dark-grey)" loading={true} />
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
        </>
      )}
    </div>
  )
}
