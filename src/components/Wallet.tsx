import styles from '@/styles/Wallet.module.css'
import { getNetworkName } from '@/utils/network'
import { Web3Button } from '@web3modal/react'
import { useEffect, useState } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import config from '../metadata/config.json'
import Button from './Button'

export default function Wallet() {
  const { chain } = useNetwork()
  const [loading, setLoading] = useState<boolean>(true)
  const [networkName, setNetworkName] = useState<string | undefined>(undefined)
  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()

  const saveNetworkName = async () => {
    if (!chain) return
    let name = await getNetworkName(chain.id)
    setNetworkName(name)
  }

  useEffect(() => {
    if (chain) {
      setLoading(false)
      saveNetworkName()
    }
  }, [chain])
  return (
    <div className={styles.container}>
      {!loading && chain && parseInt(config[0].chainId) !== chain?.id && (
        <Button
          disabled={!switchNetwork || parseInt(config[0].chainId) === chain?.id}
          onClick={() => switchNetwork?.(parseInt(config[0].chainId))}
          text={
            isLoading && pendingChainId === parseInt(config[0].chainId)
              ? 'Switching to Ethereum...'
              : 'Switch Network to Ethereum'
          }
        />
      )}
      <div className={styles.walletInfoContainer}>
        {!loading && chain && networkName && (
          <span className={styles.chainName}>{networkName}</span>
        )}
        <Web3Button />
      </div>
    </div>
  )
}
