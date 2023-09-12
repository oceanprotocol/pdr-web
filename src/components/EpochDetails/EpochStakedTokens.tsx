import { useMediaQuery } from '@react-hook/media-query'
import styles from '../../styles/Epoch.module.css'
import { SubscriptionStatus } from '../Subscription'

export type TEpochStakedTokensProps = {
  showLabel?: boolean | undefined
  stakedUp?: number | undefined
  direction?: number | undefined
  totalStaked?: number | undefined
  subscription?: SubscriptionStatus
}

export const EpochStakedTokens: React.FC<TEpochStakedTokensProps> = ({
  stakedUp,
  totalStaked,
  direction,
  showLabel
}) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  return !showLabel ? (
    <div className={styles.stekesContainer}>
      <div className={styles.stake}>
        <span className={styles.stakeAmount}>
          {stakedUp ? parseFloat(stakedUp.toString()).toFixed(1) : 0}
        </span>
        <img
          className={styles.stakeDirectionArrow}
          alt="stakedArrow"
          src={`/assets/icons/arrowUp${prefersDarkMode ? 'White' : ''}.png`}
        ></img>
      </div>
      <div className={`${styles.stake} ${styles.stakeMarginLeft}`}>
        <span className={styles.stakeAmount}>
          {totalStaked && stakedUp !== undefined
            ? parseFloat((totalStaked - stakedUp).toString()).toFixed(1)
            : 0}
        </span>
        <img
          className={styles.stakeDirectionArrow}
          alt="stakedArrow"
          src={`/assets/icons/arrowDown${prefersDarkMode ? 'White' : ''}.png`}
        ></img>
      </div>
    </div>
  ) : (
    <div
      className={styles.stake}
      style={{
        height: '25px',
        width: '100%',
        paddingTop: '5px'
      }}
    >
      <img
        className={styles.tokenImage}
        src={'oceanToken.png'}
        alt="Coin symbol image"
      />
      <span className={styles.stakeText}>
        {`${
          direction == undefined
            ? '?'
            : totalStaked
            ? totalStaked.toLocaleString()
            : 0
        } ${showLabel ? 'staked' : ''}`}
      </span>
    </div>
  )
}
