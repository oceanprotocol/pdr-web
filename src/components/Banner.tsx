import Button from '@/elements/Button'
import { currentConfig } from '@/utils/appconstants'
import { checkForBannerMessage } from '@/utils/utils'
import { useEffect, useState } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import styles from '../styles/Banner.module.css'
const chainId = currentConfig.chainId

export enum States {
  'WARNING' = 'binance',
  'ERROR' = 'kraken'
}

export type BannerState = {
  message: string | undefined
  type: States
}

export default function Banner() {
  const [state, setState] = useState<BannerState>({
    message: undefined,
    type: States.WARNING
  })
  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const { address } = useAccount()
  const { chain } = useNetwork()

  useEffect(() => {
    setState(checkForBannerMessage(address, chain?.id))
  }, [address, chain])
  if (!state.message) return null
  return (
    <div
      className={`${styles.container} ${
        state.type === States.WARNING ? styles.warning : styles.error
      }`}
    >
      <span className={styles.text}>{state.message}</span>
      {chain && parseInt(chainId) !== chain?.id && (
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
