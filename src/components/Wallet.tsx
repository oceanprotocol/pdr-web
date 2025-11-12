import styles from '@/styles/Wallet.module.css'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAccount, useChainId, useChains, useDisconnect } from 'wagmi'
import Button from '../elements/Button'

export default function Wallet() {
  // States
  const [loading, setLoading] = useState<boolean>(true)
  const [networkName, setNetworkName] = useState<string | undefined>(undefined)
  const [buttonText, setButtonText] = useState<string>('Connect Wallet')
  const [showPopup, setShowPopup] = useState<boolean>(false)

  // Refs
  const popupRef = useRef<HTMLDivElement>(null)

  // Custom Hooks
  const chainId = useChainId()
  const chains = useChains()
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()

  const { address, isConnected } = useAccount()

  // Function to save network name
  const saveNetworkName = useCallback(
    async (chainIdNum: number) => {
      try {
        const name = chains.find((c: any) => c.id === chainIdNum)?.name
        setNetworkName(name || `Chain ${chainIdNum}`)
        setLoading(false)
      } catch (error) {
        console.warn('Failed to get network name for chain:', chainIdNum, error)
        setNetworkName(`Chain ${chainIdNum}`)
        setLoading(false)
      }
    },
    [chains]
  )

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

  // Handle click outside popup to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(`.${styles.button}`)
      ) {
        setShowPopup(false)
      }
    }

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPopup])

  // Handle button click - show popup if connected, otherwise open connect modal
  const handleButtonClick = () => {
    if (isConnected && address) {
      setShowPopup(!showPopup)
    } else {
      openConnectModal?.()
    }
  }

  // Handle disconnect with error handling for WalletConnect encryption errors
  const handleDisconnect = async () => {
    try {
      setShowPopup(false)
      await disconnect()
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.toString() || String(error) || ''

      // Check if it's a WalletConnect encryption error
      if (
        errorMessage.includes('aes/gcm') ||
        errorMessage.includes('ghash tag') ||
        errorMessage.includes('invalid ghash') ||
        errorMessage.includes('decryption failed') ||
        errorMessage.includes('ciphertext')
      ) {
        console.warn(
          'WalletConnect encryption error during disconnect, clearing session data'
        )

        // Clear WalletConnect session data
        try {
          const keysToRemove: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (
              key &&
              (key.startsWith('wc@') ||
                key.startsWith('walletconnect') ||
                key.includes('walletconnect'))
            ) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key))
        } catch (clearError) {
          console.error('Failed to clear WalletConnect data:', clearError)
        }

        // Force disconnect by reloading the page
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        // For other errors, just log them
        console.error('Error disconnecting wallet:', error)
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.walletInfoContainer}>
        {!loading && isConnected && address && chainId && networkName && (
          <span className={styles.chainName}>{networkName}</span>
        )}
        <div className={styles.buttonWrapper}>
          <Button
            className={styles.button}
            onClick={handleButtonClick}
            text={buttonText}
          />
          {showPopup && isConnected && address && (
            <div ref={popupRef} className={styles.popup}>
              <div className={styles.popupContent}>
                <Button
                  className={styles.button}
                  onClick={handleDisconnect}
                  text="Disconnect"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
