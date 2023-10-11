import { AssetsContainer } from '@/components/AssetsContainer'

import { TimeFrameSwitch } from '@/components/TimeFrameSwitch'
import styles from '@/styles/Home.module.css'
import 'react-notifications/lib/notifications.css'

export default function Home() {
  return (
    <>
      <div className={styles.description}>
        <p className={styles.oneliner}>
          Accurate price predictions for your favorite crypto assets
        </p>
        <TimeFrameSwitch />
      </div>
      <AssetsContainer />
    </>
  )
}
