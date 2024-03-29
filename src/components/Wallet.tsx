import styles from '@/styles/Wallet.module.css'
import { currentConfig } from '@/utils/appconstants'
import { networkProvider } from '@/utils/networkProvider'
import { useWeb3Modal } from '@web3modal/react'
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import Button from '../elements/Button'

export default function Wallet() {
  // States
  const [loading, setLoading] = useState<boolean>(true)
  const [networkName, setNetworkName] = useState<string | undefined>(undefined)
  const [buttonText, setButtonText] = useState<string>('Connect Wallet')

  // Custom Hooks
  const { chain } = useNetwork()
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { chainId } = currentConfig

  // Function to save network name
  const saveNetworkName = useCallback<
    (
      chain: NonNullable<ReturnType<typeof useNetwork>['chain']>
    ) => Promise<void>
  >(async (chain) => {
    const name = networkProvider.getNetworkName(chain.id)
    setNetworkName(name)
  }, [])

  // useEffect to save network name and set loading state
  useEffect(() => {
    if (chain) {
      saveNetworkName(chain)
      setLoading(false)
    }
  }, [chain, saveNetworkName])

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
        {!loading && chain && networkName && (
          <span className={styles.chainName}>{networkName}</span>
        )}
        <Button
          className={styles.button}
          onClick={() => open()}
          text={buttonText}
        />
      </div>
    </div>
  )
}
