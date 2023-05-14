import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useEffect, useState } from 'react'
import { useUserContext } from '../contexts/UserContext'
import styles from '../styles/Balance.module.css'

// TODO - Fix balance component so it stops throwing errors into the console
export default function Balance() {
  const { balance: userBalance } = useUserContext()
  const { balance: localBalance, updateBalance } = useLocalEpochContext()

  const [balance, setBalance] = useState(0)

  useEffect(() => {
    setBalance(userBalance);
  }, [userBalance]);

  useEffect(() => {
    setBalance(localBalance);
  }, [localBalance]);

  return <div className={styles.container}>BALANCE: {balance} OCEAN</div>
}
