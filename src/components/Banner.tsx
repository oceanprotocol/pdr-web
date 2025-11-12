import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useUserContext } from '@/contexts/UserContext'
import Button from '@/elements/Button'
import { useIsCorrectChain } from '@/hooks/useIsCorrectChain'
import { currentConfig } from '@/utils/appconstants'
import { checkForBannerMessage } from '@/utils/utils'
import { useChainModal } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useAccount, useChains, useSwitchChain } from 'wagmi'
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
  const { openChainModal } = useChainModal()
  const { address } = useAccount()
  const { getUserSignature } = usePredictoorsContext()
  const { isCorrectNetwork } = useIsCorrectChain()
  const chains = useChains()
  const { isPending: isLoading, variables } = useSwitchChain()
  const pendingChainId = variables?.chainId

  useEffect(() => {
    // Check for wrong network first (has higher priority than signature)
    if (address && !isCorrectNetwork) {
      const expectedChain = chains.find((c) => c.id === parseInt(chainId))
      const chainName = expectedChain?.name
      const message = chainName
        ? `Connected to wrong network! Please switch to ${chainName}`
        : `Connected to wrong network! Please switch to chain ID ${chainId}`
      setState({
        message,
        type: States.WARNING
      })
      return
    }

    // Then check for missing signature
    if (!userSignature && address) {
      setState({
        message:
          'Signature not provided. Signature is needed to authorize and fetch private predicitons',
        type: States.ERROR
      })
      return
    }

    // Default check
    const bannerState = checkForBannerMessage(address, isCorrectNetwork)
    setState(bannerState)
  }, [address, isCorrectNetwork, userSignature, chainId, chains])

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
      {!isCorrectNetwork && address && (
        <Button
          disabled={!openChainModal}
          onClick={() => openChainModal?.()}
          className={styles.switchNetwork}
          text={
            isLoading && pendingChainId === parseInt(chainId)
              ? 'Switching...'
              : (() => {
                  const expectedChain = chains.find(
                    (c) => c.id === parseInt(chainId)
                  )
                  return expectedChain?.name
                    ? `Switch Network to ${expectedChain.name}`
                    : `Switch Network`
                })()
          }
        />
      )}
    </div>
  )
}
