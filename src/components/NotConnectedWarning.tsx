import styles from '@/styles/Home.module.css'

export const NotConnectedWarning = () => {
  return (
    <>
      <div className={styles.errorDescription}>
        <p className={styles.oneliner}>
          {"Couldn't connect to the networks RPC. Try again latter."}
        </p>
      </div>
    </>
  )
}
