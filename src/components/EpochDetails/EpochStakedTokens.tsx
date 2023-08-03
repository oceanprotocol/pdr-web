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
      <span>{`${stakedAmount / 100000000000} STAKED`}</span>
    </div>
  )
}
