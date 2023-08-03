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
      <span className={styles.stakeText}>{`${(
        stakedAmount / 100000000000
      ).toLocaleString()} STAKED`}</span>
    </div>
  )
}
