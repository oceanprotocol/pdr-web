import styles from '@/styles/Header.module.css'
import { Web3Button } from '@web3modal/react'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>PREDICTOOR</h1>
      <Web3Button />
    </div>
  )
}
