import { AssetsContainer } from '@/components/AssetsContainer'
import Balance from '@/components/Balance'
import Banner from '@/components/Banner'
import Header from '@/components/Header'
import styles from '@/styles/Home.module.css'
import { Inter } from 'next/font/google'
import 'react-notifications/lib/notifications.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Banner />
      <main className={`${styles.main} ${inter.className}`}>
        <Header />
        <div className={styles.description}>
          <p className={styles.oneliner}>
            Accurate price predictions for your favorite crypto assets
          </p>
          <Balance />
        </div>
        <AssetsContainer />
      </main>
    </>
  )
}
