import Button from '@/elements/Button'
import { useIsCorrectChain } from '@/hooks/useIsRightNetwork'
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
  const { chains } = useNetwork()
  const { chain, isCorrectNetwork } = useIsCorrectChain()

  useEffect(() => {
    setState(checkForBannerMessage(address, isCorrectNetwork))
  }, [address, isCorrectNetwork])

  if (!state.message) return null
  return (
    <div
      className={`${styles.container} ${
        state.type === States.WARNING ? styles.warning : styles.error
      }`}
    >
      <span className={styles.text}>{state.message}</span>
      {chain && !isCorrectNetwork && (
        <Button
          disabled={!switchNetwork || isCorrectNetwork}
          onClick={() => switchNetwork?.(parseInt(chainId))}
          className={styles.switchNetwork}
          text={
            isLoading && pendingChainId === parseInt(chainId)
              ? 'Switching to Ethereum...'
              : `Switch Network to ${
                  chains.find((c) => c.id == parseInt(chainId))?.name
                }`
          }
        />
      )}
    </div>
  )
}
