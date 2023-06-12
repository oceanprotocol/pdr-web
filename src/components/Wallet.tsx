import styles from '@/styles/Wallet.module.css'
import { currentConfig } from '@/utils/appconstants'
import { networkProvider } from '@/utils/networkProvider'
import { useWeb3Modal } from '@web3modal/react'
import { useEffect, useState } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import Button from '../elements/Button'

export default function Wallet() {
  const [loading, setLoading] = useState<boolean>(true)
  const [networkName, setNetworkName] = useState<string | undefined>(undefined)
  const [buttonText, setButtonText] = useState<string>('Connect Wallet')

  const { chain } = useNetwork()
  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()

  const { chainId } = currentConfig

  const saveNetworkName = async () => {
    if (!chainId) return
    const name = networkProvider.getNetworkName(parseInt(chainId))
    setNetworkName(name)
  }

  useEffect(() => {
    if (chain) {
      saveNetworkName()
      setLoading(false)
    }
  }, [chain])

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
        <button className={styles.button} onClick={() => open()}>
          {buttonText}
        </button>
      </div>
      {!loading && chain && parseInt(chainId) !== chain?.id && (
        <Button
          disabled={!switchNetwork || parseInt(chainId) === chain?.id}
          onClick={() => switchNetwork?.(parseInt(chainId))}
          className={styles.switchNetwork}
          text={
            isLoading && pendingChainId === parseInt(chainId)
              ? 'Switching to Ethereum...'
              : 'Switch Network to Ethereum'
          }
        />
      )}
    </div>
  )
}
