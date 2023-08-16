import styles from '../../styles/Epoch.module.css'

export type TEpochStakedTokensProps = {
  stakedAmount: number
  showLabel?: boolean
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
      <span className={styles.stakeText}>{`${stakedAmount.toLocaleString()} ${
        showLabel ? 'STAKED' : ''
      }`}</span>
    </div>
  )
}
