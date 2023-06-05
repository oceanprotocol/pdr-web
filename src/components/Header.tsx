import styles from '@/styles/Header.module.css'
import Settings from './Settings'
import Wallet from './Wallet'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>PREDICTOOR</h1>
      <div className={styles.connections}>
        <Settings />
        <Wallet />
      </div>
    </div>
  )
}
