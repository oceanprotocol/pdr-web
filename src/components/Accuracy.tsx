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
      >{`${accuracy.toLocaleString()}%`}</span>
    </div>
  )
}
