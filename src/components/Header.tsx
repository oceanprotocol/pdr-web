import styles from '@/styles/Header.module.css'
import Wallet from './Wallet'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>PREDICTOOR</h1>
      <Wallet />
    </div>
  )
}
