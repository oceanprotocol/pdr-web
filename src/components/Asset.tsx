import styles from '../styles/Asset.module.css'
import { TokenData } from '../utils/asset'

export default function Asset({
  assetData
}: {
  assetData: TokenData | undefined
}) {
  if (!assetData) return null

  return (
    <div className={styles.container}>
      <img
        className={styles.image}
        src={`/assets/icons/${assetData.symbol}.svg`}
        alt="Coin symbol image"
      />
      {assetData.name.toUpperCase()}
    </div>
  )
}
