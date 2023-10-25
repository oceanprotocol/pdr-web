import { BurgerMenuButton } from '@/elements/BurgerMenuButton'
import styles from '@/styles/Header.module.css'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MenuList } from './MenuList'
import Wallet from './Wallet'

export type THeaderProps = {
  isWalletActive?: boolean
}

export default function Header({ isWalletActive = true }: THeaderProps) {
  const [isMenuActive, setIsMenuActive] = useState(false)
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
        <BurgerMenuButton
          onClick={() => {
            setIsMenuActive(true)
          }}
        />
        <MenuList
          isActive={isMenuActive}
          closeAction={() => setIsMenuActive(false)}
        />
      </div>
    </div>
  )
}
