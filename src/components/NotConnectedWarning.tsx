import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'

export const NotConnectedWarning = () => {
  const [isClient, setIsClient] = useState(false)

  // Check if client-side
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <div className={styles.errorDescription}>
        <p className={styles.oneliner}>
          {isClient &&
            "Couldn't connect to the networks RPC. Try again latter."}
        </p>
      </div>
    </>
  )
}
