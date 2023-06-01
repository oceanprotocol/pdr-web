import styles from '@/styles/Wallet.module.css'
import { getNetworkName } from '@/utils/network'
import { Web3Button } from '@web3modal/react'
import { useEffect, useState } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import Button from '../elements/Button'
import config from '../metadata/config.json'

export default function Wallet() {
  const {chain} = useNetwork()
  const [loading, setLoading] = useState<boolean>(true)
  const [networkName, setNetworkName] = useState<string | undefined>(undefined)
  const {isLoading, pendingChainId, switchNetwork} = useSwitchNetwork()
  const [curConfig, setCurConfig] = useState<any>(null)

  const saveNetworkName = async () => {
    if (!chain) return
    let name = await getNetworkName(chain.id)
    setNetworkName(name)
  }

  useEffect(() => {
    if (chain) {
      saveNetworkName()    
      setCurConfig(config[process.env.NEXT_PUBLIC_ENV?.toString() as keyof typeof config]);
      setLoading(false)
    }
  }, [chain])
  
  return (
    <div className={styles.container}>
      {!loading && chain && parseInt(curConfig?.chainId) !== chain?.id && (
        <Button
          disabled={!switchNetwork || parseInt(curConfig?.chainId) === chain?.id}
          onClick={() => switchNetwork?.(parseInt(curConfig?.chainId))}
          text={
            isLoading && pendingChainId === parseInt(curConfig?.chainId)
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
