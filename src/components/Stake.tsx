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
    return `${
      delta ? (delta > 0 && delta < 0.5 ? '' : delta > 0 ? '+' : '-') : '?'
    }${delta ? Math.abs(delta).toFixed(0) : ''}%`
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
        style={{
          color: delta
            ? delta > 0 && delta < 0.5
              ? 'var(--dark-grey)'
              : delta > 0
              ? 'var(--green)'
              : 'var(--red)'
            : 'var(--dark-grey)'
        }}
      >
        {getDelta()}
      </span>
    </div>
  )
}
