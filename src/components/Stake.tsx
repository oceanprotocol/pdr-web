import styles from '../styles/Stake.module.css'

export default function Stake({
  totalStake,
  totalStakePreviousDay
}: {
  totalStake: number
  totalStakePreviousDay: number
}) {
  let delta =
    ((totalStake - totalStakePreviousDay) / totalStakePreviousDay) * 100
  const getDelta = (): string => {
    return `${delta > 0 ? '+' : '-'}${Math.abs(delta).toFixed(0)}%`
  }

  return (
    <div className={styles.container}>
      <div className={styles.container}>
        <img
          className={styles.tokenImage}
          src={'oceanToken.png'}
          alt="Coin symbol image"
        />
        <span className={styles.accuracy}>{totalStake.toFixed(0)}</span>
      </div>
      <span
        className={styles.delta}
        style={{ color: delta > 0 ? '#3AD315' : '#E40F16' }}
      >
        {getDelta()}
      </span>
    </div>
  )
}
