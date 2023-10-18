import styles from '@/styles/Header.module.css'
import { useRouter } from 'next/navigation'
import { MenuList } from './MenuList'
import Wallet from './Wallet'

export type THeaderProps = {
  isWalletActive?: boolean
}

export default function Header({ isWalletActive = true }: THeaderProps) {
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
        {isWalletActive && <Wallet />}
        <MenuList />
      </div>
    </div>
  )
}
