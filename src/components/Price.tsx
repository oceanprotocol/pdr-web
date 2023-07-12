import Image from 'next/image'
import styles from '../styles/Price.module.css'
import { TokenData } from '../utils/coin'

export default function Coin({
  coinData,
  market
}: {
  coinData: TokenData | undefined
  market: string
}) {
  if (!coinData) return null

  return (
    <div className={styles.container}>
      <Image
        src={market == 'binance' ? '/binance-logo.png' : '/kraken-logo.png'}
        alt="binanceLogo"
        width={20}
        height={20}
      />
      <span className={styles.price}>{coinData.price.toLocaleString()}</span>
    </div>
  )
}
