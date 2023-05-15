import styles from '@/styles/Wallet.module.css'
import { Web3Button } from '@web3modal/react'
import { useEffect } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import config from '../metadata/config.json'

export default function Wallet() {
  const { chain } = useNetwork()
  const { error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  useEffect(() => {
    chain && console.log(chain)
  }, [chain])
  return (
    <div className={styles.container}>
      {chain && parseInt(config[0].chainId) !== chain?.id && (
        <button
          disabled={!switchNetwork || parseInt(config[0].chainId) === chain?.id}
          key={parseInt(config[0].chainId)}
          onClick={() => switchNetwork?.(parseInt(config[0].chainId))}
        >
          Ethereum
          {isLoading &&
            pendingChainId === parseInt(config[0].chainId) &&
            ' (switching)'}
        </button>
      )}
      {chain && <span className={styles.chainName}>{chain.name}</span>}
      <div>{error && error.message}</div>
      <Web3Button />
    </div>
  )
}
