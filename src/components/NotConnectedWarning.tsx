import { EEthereumClientStatus } from '@/hooks/useEthereumClient'
import styles from '@/styles/Home.module.css'
import React, { useEffect, useState } from 'react'

export type TNotConnectedWarningProps = {
  clientStatus:
    | EEthereumClientStatus.DISCONNECTED
    | EEthereumClientStatus.LOADING
}

export const NotConnectedWarning: React.FC<TNotConnectedWarningProps> = ({
  clientStatus
}) => {
  const [isClient, setIsClient] = useState(false)

  const isClientLoading =
    isClient && clientStatus === EEthereumClientStatus.LOADING

  const isClientDisconnected =
    isClient && clientStatus === EEthereumClientStatus.DISCONNECTED

  // Check if client-side
  useEffect(() => {
    setIsClient(true)
  }, [])
  return (
    <>
      {(!isClient || isClientLoading) && ''}
      {isClientDisconnected && (
        <div className={styles.errorDescription}>
          <p className={styles.oneliner}>
            "Couldn't connect to the networks RPC. Try again latter."
          </p>
        </div>
      )}
    </>
  )
}
