import styles from '@/styles/Header.module.css'
import { MenuList } from './MenuList'
import Settings from './Settings'
import Wallet from './Wallet'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1></h1>
      <div className={styles.connections}>
        <Settings />
        <Wallet />
        <MenuList />
      </div>
    </div>
  )
}
