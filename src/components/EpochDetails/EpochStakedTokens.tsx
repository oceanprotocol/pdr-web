import styles from '../../styles/Epoch.module.css'

export type TEpochStakedTokensProps = {
  showLabel?: boolean
  stakedAmount?: number
}

export const EpochStakedTokens: React.FC<TEpochStakedTokensProps> = ({
  stakedAmount,
  showLabel
}) => {
  return (
  <div className={styles.stake}>
      <img
        className={styles.tokenImage}
        src={'oceanToken.png'}
        alt="Coin symbol image"
      />
      <span className={styles.stakeText}>
        {stakedAmount
          ? `${stakedAmount.toLocaleString()} ${showLabel ? 'STAKED' : ''}`
          : 'No Stake'}
      </span>
    </div>
  )
}
