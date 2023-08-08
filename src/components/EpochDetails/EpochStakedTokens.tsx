import styles from '../../styles/Epoch.module.css'

export type TEpochStakedTokensProps = {
  stakedAmount: number
}

export const EpochStakedTokens: React.FC<TEpochStakedTokensProps> = ({
  stakedAmount
}) => {
  return (
    <div className={styles.stake}>
      <img
        className={styles.tokenImage}
        src={'oceanToken.png'}
        alt="Coin symbol image"
      />
      <span
        className={styles.stakeText}
      >{`${stakedAmount.toLocaleString()} STAKED`}</span>
    </div>
  )
}
