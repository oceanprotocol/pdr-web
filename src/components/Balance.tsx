import { useLocalEpochContext } from '@/contexts/LocalEpochContext';
import { useEffect, useState } from 'react';
import { useUserContext } from '../contexts/UserContext';

// TODO - Fix balance component so it stops throwing errors into the console
export default function Balance() {
  const { balance: userBalance } = useUserContext()
  const { balance: localBalance, updateBalance } = useLocalEpochContext()

  const [balance, setBalance] = useState(0)

  const initComponent = () => {
    setBalance(userBalance);
    
    // TODO - Init local settings if it's not initiaized
    // If in local mode, we want to use the mock data & implementation
    // if (process.env.NEXT_PUBLIC_ENV == 'local') {
    //   console.log("init localBalance", localBalance)
    //   const initBalance = 100;
    //   updateBalance(initBalance);
    //   setBalance(initBalance);
    // } 
  }

  useEffect(() => {
    initComponent()
  }, [])

  useEffect(() => {
    setBalance(userBalance);
    
    // If in local mode, we want to use the mock data & implementation
    if (process.env.NEXT_PUBLIC_ENV == 'local') {
      setBalance(localBalance);
    }
  }, [userBalance, localBalance])

  return <div>Balance: {balance} OCEAN</div>
}
