import styles from '@/styles/Wallet.module.css'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useChainId, useChains } from 'wagmi'
import Button from '../elements/Button'

export default function Wallet() {
  // States
  const [loading, setLoading] = useState<boolean>(true)
  const [networkName, setNetworkName] = useState<string | undefined>(undefined)
  const [buttonText, setButtonText] = useState<string>('Connect Wallet')

  // Custom Hooks
  const chainId = useChainId()
  const chains = useChains()
  const { openConnectModal } = useConnectModal()

  const { address, isConnected } = useAccount()

  // Function to save network name
  const saveNetworkName = useCallback(async (chainIdNum: number) => {
    try {
      const name = chains.find((c: any) => c.id === chainIdNum)?.name
      setNetworkName(name || `Chain ${chainIdNum}`)
      setLoading(false)
    } catch (error) {
      console.warn('Failed to get network name for chain:', chainIdNum, error)
      setNetworkName(`Chain ${chainIdNum}`)
      setLoading(false)
    }
  }, [])

  // useEffect to save network name and set loading state
  // This should react to chain changes from the wallet
  useEffect(() => {
    // Only show network name when wallet is connected
    if (isConnected && address && chainId && chainId > 0) {
      saveNetworkName(chainId)
    } else {
      setLoading(true)
      setNetworkName(undefined)
    }
  }, [chainId, isConnected, address, saveNetworkName])

  // useEffect to set button text based on address and connection status
  useEffect(() => {
    if (!isConnected || !address) {
      setButtonText('Connect Wallet')
      return
    }
    // make address like 0x...1234
    setButtonText(`${address.slice(0, 6)}...${address.slice(-4)}`)
  }, [isConnected, address])

  return (
    <div className={styles.container}>
      <div className={styles.walletInfoContainer}>
        {!loading && isConnected && address && chainId && networkName && (
          <span className={styles.chainName}>{networkName}</span>
        )}
        <Button
          className={styles.button}
          onClick={() => openConnectModal?.()}
          text={buttonText}
        />
      </div>
    </div>
  )
}
