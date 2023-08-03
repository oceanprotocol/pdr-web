import { useUserContext } from '@/contexts/UserContext'
import styles from '../styles/Balance.module.css'

export default function Balance() {
  const { balance } = useUserContext()

  return (
    <div className={styles.container}>
      <span className={styles.component}>BALANCE</span>
      <span className={styles.component}>
        <img
          className={styles.tokenImage}
          src={'oceanToken.png'}
          alt="Coin symbol image"
        />
        {balance.toLocaleString()}
      </span>
    </div>
  )
}
