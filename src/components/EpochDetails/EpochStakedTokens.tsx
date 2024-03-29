import styles from '../../styles/Epoch.module.css'
import { ArrowDown } from '../ArrowDown'
import { ArrowUp } from '../ArrowUp'
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
  return !showLabel ? (
    <div className={styles.stekesContainer}>
      <div className={styles.stake}>
        <span className={styles.stakeAmount}>
          {stakedUp && stakedUp > 0
            ? stakedUp >= 0.01
              ? stakedUp.toLocaleString()
              : '<0.01'
            : 0}
        </span>
        <ArrowUp width={8} height={8} />
      </div>
      <div className={`${styles.stake} ${styles.stakeMarginLeft}`}>
        <span className={styles.stakeAmount}>
          {totalStaked && stakedUp !== undefined && totalStaked - stakedUp > 0
            ? totalStaked - stakedUp >= 0.01
              ? (totalStaked - stakedUp).toLocaleString()
              : '<0.01'
            : 0}
        </span>
        <ArrowDown width={8} height={8} />
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
