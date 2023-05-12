import { useUserContext } from '../contexts/UserContext'
import styles from '../styles/Balance.module.css'

// TODO - Fix balance component so it stops throwing errors into the console
export default function Balance() {
  const { balance } = useUserContext()
  return <div className={styles.container}>BALANCE: {balance} OCEAN</div>
}
