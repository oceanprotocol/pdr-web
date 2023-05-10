import styles from '../styles/Coin.module.css'
import { TokenData } from '../utils/coin'

export default function Coin({ coinData }: { coinData: TokenData }) {
  return (
    <div className={styles.container}>
      <img
        className={styles.image}
        src={coinData.image}
        alt="Coin symbol image"
      />
      {coinData.name}
    </div>
  )
}
