import styles from '../styles/Accuracy.module.css'

export default function Accuracy({
  accuracy
}: {
  accuracy: number
}) {
  return (
    <div className={styles.container}>
      <span
        className={styles.accuracy}
      >{`${accuracy > 0.0 ? parseFloat(accuracy.toFixed(1)) : 0.0}%`}</span>
    </div>
  )
}
