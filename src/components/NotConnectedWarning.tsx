import styles from '@/styles/Home.module.css'

export const NotConnectedWarning = () => {
  return (
    <>
      <div className={styles.description}>
        <p className={styles.oneliner}>
          {"Couldn't connect to the networks RPC"}
        </p>
      </div>
    </>
  )
}
