import styles from '@/styles/Header.module.css'
import { useRouter } from 'next/navigation'
import { MenuList } from './MenuList'
import Wallet from './Wallet'

export default function Home() {
  const router = useRouter()
  const navigateToHomePage = () => {
    router.push('/')
  }

  return (
    <div className={styles.container}>
      <img
        className={styles.logo}
        src={'logo.png'}
        alt="Predictoor logo"
        onClick={() => navigateToHomePage()}
      />
      <div className={styles.connections}>
        <Wallet />
        <MenuList />
      </div>
    </div>
  )
}
