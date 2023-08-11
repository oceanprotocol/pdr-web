import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useUserContext } from '@/contexts/UserContext'
import Button from '@/elements/Button'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { currentConfig } from '@/utils/appconstants'
import { useCallback, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import styles from '../styles/Subscription.module.css'

export enum SubscriptionStatus {
  'INACTIVE' = 'inactive',
  'ACTIVE' = 'active',
  'FREE' = 'free'
}

export interface SubscriptionData {
  status: SubscriptionStatus
  duration: number
  price: number
}

export type TSubscriptionProps = {
  subscriptionData: SubscriptionData | undefined
  contractAddress: string
}

export default function Subscription({
  subscriptionData,
  contractAddress
}: TSubscriptionProps) {
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()
  const { chainId } = currentConfig
  const { refetchBalance } = useUserContext()
  const signer = useEthersSigner({})

  const { getPredictorInstanceByAddress, runCheckContracts } =
    usePredictoorsContext()
  const [isBuying, setIsBuying] = useState(false)

  const BuyAction = useCallback<
    (args: { currentStatus: SubscriptionStatus }) => Promise<void>
  >(
    async ({ currentStatus }) => {
      if (
        !isConnected ||
        currentStatus !== SubscriptionStatus.INACTIVE ||
        !address
      )
        return

      console.log('buying')
      const predictorInstance = getPredictorInstanceByAddress(contractAddress)
      console.log('predictorinstance found', !!predictorInstance)
      if (!predictorInstance) return
      setIsBuying(true)
      console.log('setIsBuying true')
      if (!signer) return
      const receipt = await predictorInstance.buyAndStartSubscription(signer)
      console.log('receipt', receipt)
      if (!!receipt) {
        runCheckContracts()
      }
      refetchBalance()
      setIsBuying(false)
    },
    [isConnected, address, getPredictorInstanceByAddress, contractAddress]
  )

  if (!subscriptionData) return null

  return (
    <div className={styles.container}>
      <span className={styles.price}>
        {subscriptionData.price > 0 ? (
          <div>
            <img
              className={styles.tokenImage}
              src={'oceanToken.png'}
              alt="Coin symbol image"
            />
            <b>{subscriptionData.price}</b> / {subscriptionData.duration}h
          </div>
        ) : (
          'FREE'
        )}
      </span>
      {subscriptionData.status === SubscriptionStatus.INACTIVE ? (
        <Button
          text={`${isBuying ? 'Buying...' : 'Buy'}`}
          onClick={() => BuyAction({ currentStatus: subscriptionData.status })}
          disabled={!isConnected || isBuying || chain?.id !== parseInt(chainId)}
        />
      ) : (
        <span className={styles.status}>{subscriptionData.status}</span>
      )}
    </div>
  )
}
