import styles from '@/styles/Home.module.css'
import MainWrapper from './MainWrapper'

export const NotConnectedWarning = () => {
  return (
    <MainWrapper withBanner={false} isWalletActive={false}>
      <div className={styles.description}>
        <p className={styles.oneliner}>{"Couldn't connect to the RPC"}</p>
      </div>
    </MainWrapper>
  )
}
