import { PredictoorEyes } from '@/elements/PredictoorEyes'
import styles from '@/styles/Header.module.css'
import { MenuList } from './MenuList'
import Wallet from './Wallet'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>
        Predict
        <PredictoorEyes />r
      </h1>
      <div className={styles.connections}>
        <Wallet />
        <MenuList />
      </div>
    </div>
  )
}
