import { useMemo } from 'react'
import styles from '../styles/Stake.module.css'

export default function Stake({
  totalStake,
  totalStakePreviousDay
}: {
  totalStake: number
  totalStakePreviousDay: number
}) {
  // Calculate the percentage change (delta)
  const delta = useMemo(() => {
    if (totalStakePreviousDay === 0) {
      return totalStake === 0 ? 0 : 100
    }
    return ((totalStake - totalStakePreviousDay) / totalStakePreviousDay) * 100
  }, [totalStake, totalStakePreviousDay])

  // Format the delta for display
  const formattedDelta = useMemo(() => {
    if (delta === undefined || delta === null) {
      return '?'
    }
    const sign = delta >= 0.5 ? '+' : delta < 0 ? '-' : ''
    return `${sign}${Math.abs(delta).toFixed(0)}%`
  }, [delta])

  // Determine the color based on the delta value
  const deltaColor = useMemo(() => {
    if (delta > 0.5) {
      return 'var(--green)'
    } else if (delta < 0) {
      return 'var(--red)'
    }
    return 'var(--dark-grey)'
  }, [delta])

  return (
    <div className={styles.container}>
      <div className={styles.container}>
        <img
          className={styles.tokenImage}
          src="oceanToken.png"
          alt="Coin symbol"
        />
        <span className={styles.accuracy}>{totalStake.toFixed(1)}</span>
      </div>
      <span className={styles.delta} style={{ color: deltaColor }}>
        {formattedDelta}
      </span>
    </div>
  )
}
