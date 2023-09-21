import styles from '../styles/Stake.module.css'

export default function Stake({ totalStake }: { totalStake: number }) {
  /*const getFormattedAccuracy = (totalStake: number): string => {
    if (accuracy % 1 === 0) {
      return `${accuracy}.0`
    } else {
      return `${accuracy.toFixed(1)}`
    }
  }*/

  return (
    <div className={styles.container}>
      <img
        className={styles.tokenImage}
        src={'oceanToken.png'}
        alt="Coin symbol image"
      />
      <span className={styles.accuracy}>{totalStake.toFixed(1)}</span>
    </div>
  )
}
