import styles from '@/styles/Header.module.css'
import { MenuList } from './MenuList'

export default function Header() {
  return (
    <div className={styles.container}>
      <h1></h1>
      <div className={styles.connections}>
        <MenuList />
      </div>
    </div>
  )
}
