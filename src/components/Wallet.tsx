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

  const currentConfig = process.env.NEXT_PUBLIC_ENV
    ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
    : config['staging']

  const saveNetworkName = async () => {
    if (!chain) return
    let name = await getNetworkName(chain.id)
    setNetworkName(name)
  }

  useEffect(() => {
    if (chain) {
      saveNetworkName()
      setLoading(false)
    }
  }, [chain])

  return (
    <div className={styles.container}>
      <div className={styles.walletInfoContainer}>
        {!loading && chain && networkName && (
          <span className={styles.chainName}>{networkName}</span>
        )}
        <Web3Button />
      </div>
      {!loading && chain && parseInt(currentConfig.chainId) !== chain?.id && (
        <Button
          disabled={
            !switchNetwork || parseInt(currentConfig.chainId) === chain?.id
          }
          onClick={() => switchNetwork?.(parseInt(currentConfig.chainId))}
          className={styles.switchNetwork}
          text={
            isLoading && pendingChainId === parseInt(currentConfig.chainId)
              ? 'Switching to Ethereum...'
              : 'Switch Network to Ethereum'
          }
        />
      )}
    </div>
  )
}
