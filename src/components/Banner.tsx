import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useUserContext } from '@/contexts/UserContext'
import Button from '@/elements/Button'
import { useIsCorrectChain } from '@/hooks/useIsCorrectChain'
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
  const { userSignature } = useUserContext()
  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const { address } = useAccount()
  const { chains } = useNetwork()
  const { getUserSignature } = usePredictoorsContext()
  const { chain, isCorrectNetwork } = useIsCorrectChain()

  useEffect(() => {
    setState(checkForBannerMessage(address, isCorrectNetwork))
    if (!userSignature)
      setState({
        message:
          'Signature not provided. Signature is needed to authorize and fetch private predicitons',
        type: States.ERROR
      })
  }, [address, isCorrectNetwork, userSignature])

  if (!state.message) return null
  return (
    <div
      className={`${styles.container} ${
        state.type === States.WARNING ? styles.warning : styles.error
      }`}
    >
      <span className={styles.text}>{state.message}</span>
      {!userSignature && (
        <Button onClick={() => getUserSignature()} text="Provide Signature" />
      )}
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
