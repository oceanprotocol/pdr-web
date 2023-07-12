import Image from 'next/image'
import styles from '../styles/Price.module.css'
import { TokenData } from '../utils/asset'

export enum Markets {
  'BINANCE' = 'binance',
  'KRAKEN' = 'kraken'
}

export default function Asset({
  assetData,
  market
}: {
  assetData: TokenData | undefined
  market: Markets
}) {
  if (!assetData) return null

  return (
    <div className={styles.container}>
      <Image
        src={
          market == Markets.BINANCE ? '/binance-logo.png' : '/kraken-logo.png'
        }
        alt="binanceLogo"
        width={20}
        height={20}
      />
      <span
        className={styles.price}
      >{`$${assetData.price.toLocaleString()}`}</span>
    </div>
  )
}
