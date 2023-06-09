import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useEffect, useState } from 'react'
// import { useUserContext } from '../contexts/UserContext'
import { BalanceCard } from '@/elements/BalanceCard'
import styles from '../styles/Balance.module.css'

// TODO - Fix balance component so it stops throwing errors into the console
export default function Balance() {
  // const { balance: userBalance } = useUserContext()
  const { balance: localBalance } = useLocalEpochContext()

  const [balance, setBalance] = useState(0)

  // TODO - Fix user balance w/ Ocean token or whatever token needed
  // useEffect(() => {
  //   setBalance(userBalance)
  // }, [userBalance])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === 'mock') {
      setBalance(localBalance)
    }
  }, [localBalance])

  return (
    <div className={styles.container}>
      <BalanceCard>Balance</BalanceCard>
      <BalanceCard>{balance} OCEAN</BalanceCard>
    </div>
  )
}
