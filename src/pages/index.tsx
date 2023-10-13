import { AssetsContainer } from '@/components/AssetsContainer'
import MainWrapper from '@/components/MainWrapper'
import { TimeFrameSwitch } from '@/components/TimeFrameSwitch'
import styles from '@/styles/Home.module.css'
import { Inter } from 'next/font/google'
import 'react-notifications/lib/notifications.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <MainWrapper>
      <div className={styles.description}>
        <p className={styles.oneliner}>
          Accurate price predictions for your favorite crypto assets
        </p>
        <TimeFrameSwitch />
      </div>
      <AssetsContainer />
    </MainWrapper>
  )
}
