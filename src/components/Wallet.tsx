import styles from '@/styles/Wallet.module.css'
import { Web3Button } from '@web3modal/react'
import { useEffect } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import config from '../metadata/config.json'
import Button from './Button'

export default function Wallet() {
  const { chain } = useNetwork()
  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  useEffect(() => {
    chain && console.log(chain)
  }, [chain])
  return (
    <div className={styles.container}>
      {chain && parseInt(config[0].chainId) !== chain?.id && (
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
        {chain && <span className={styles.chainName}>{chain.name}</span>}
        <Web3Button />
      </div>
    </div>
  )
}
