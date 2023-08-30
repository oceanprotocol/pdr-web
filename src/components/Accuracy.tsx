import styles from '../styles/Accuracy.module.css'
import { TokenData } from '../utils/asset'

export default function Accuracy({
  assetData
}: {
  assetData: TokenData | undefined
}) {
  if (!assetData) return null

  return (
    <div className={styles.container}>
      <span
        className={styles.accuracy}
      >{`${assetData.accuracy.toLocaleString()}%`}</span>
    </div>
  )
}
