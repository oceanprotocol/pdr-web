import { Web3Button } from '@web3modal/react'
import styles from '@/styles/Header.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
        <span>LOGO</span>
        <Web3Button />
    </div>
  )
}
