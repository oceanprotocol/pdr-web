import styles from '@/styles/Header.module.css'
import { MenuList } from './MenuList'
import Wallet from './Wallet'

export default function Home() {
  return (
    <div className={styles.container}>
      <img className={styles.logo} src={'logo.png'} alt="Predictoor logo" />
      <div className={styles.connections}>
        <Wallet />
        <MenuList />
      </div>
    </div>
  )
}
