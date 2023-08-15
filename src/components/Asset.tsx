import Image from 'next/image'
import styles from '../styles/Asset.module.css'
import { TokenData } from '../utils/asset'

export enum Markets {
  'BINANCE' = 'binance',
  'KRAKEN' = 'kraken'
}

export default function Asset({
  assetData
}: {
  assetData: TokenData | undefined
}) {
  if (!assetData) return null

  return (
    <div className={styles.container}>
      <Image
        src={
          assetData.market == Markets.BINANCE
            ? '/binance-logo.png'
            : '/kraken-logo.png'
        }
        alt="marketLogo"
        width={28}
        height={28}
      />
      <img
        className={styles.image}
        src={`/assets/icons/${assetData.symbol}.svg`}
        alt="Coin symbol image"
      />
      <span className={styles.assetName}>{assetData.name}</span>
    </div>
  )
}
