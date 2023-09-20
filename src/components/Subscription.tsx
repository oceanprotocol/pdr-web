import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { TPredictoorsContext } from '@/contexts/PredictoorsContext.types'
import { useUserContext } from '@/contexts/UserContext'
import Button, { ButtonType } from '@/elements/Button'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useIsCorrectChain } from '@/hooks/useIsCorrectChain'
import { NonError, ValueOf } from '@/utils/utils'
import { useCallback, useMemo, useState } from 'react'
import { NotificationManager } from 'react-notifications'
import { useAccount } from 'wagmi'
import styles from '../styles/Subscription.module.css'

export enum SubscriptionStatus {
  'INACTIVE' = 'inactive',
  'ACTIVE' = 'active',
  'FREE' = 'FREE'
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

type TContractPriceInfo = {
  price: NonError<NonNullable<ValueOf<TPredictoorsContext['contractPrices']>>>
  alternativeText?: string
}

export default function Subscription({
  subscriptionData,
  contractAddress
}: TSubscriptionProps) {
  const { isConnected, address } = useAccount()
  const { refetchBalance } = useUserContext()
  const signer = useEthersSigner({})
  const { isCorrectNetwork } = useIsCorrectChain()

  const { getPredictorInstanceByAddress, runCheckContracts, contractPrices } =
    usePredictoorsContext()
  const [isBuying, setIsBuying] = useState(false)

  const contractPriceInfo: TContractPriceInfo = useMemo(() => {
    const loadingResult = {
      price: 0,
      alternativeText: 'Loading...'
    }

    if (Object.keys(contractPrices).length === 0) return loadingResult

    const contractPrice = contractPrices[contractAddress]

    if (!contractPrice || contractPrice instanceof Error) return loadingResult

    return { price: contractPrice }
  }, [contractPrices, contractAddress])

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

      try {
        const predictorInstance = getPredictorInstanceByAddress(contractAddress)

        if (!predictorInstance) return
        setIsBuying(true)

        if (!signer) return
        const receipt = await predictorInstance.buyAndStartSubscription(signer)

        if (!!receipt) {
          runCheckContracts()
        }
        refetchBalance()
        setIsBuying(false)
        NotificationManager.success(
          '',
          'Subscription purchase succesful!',
          5000
        )
      } catch (e: any) {
        console.error(e)
        setIsBuying(false)
        NotificationManager.error(e, 'Subscription purchase failed!', 5000)
      }
    },
    [isConnected, address, getPredictorInstanceByAddress, contractAddress]
  )

  if (!subscriptionData) return null

  return (
    <div className={`${styles.price} ${styles.container}`}>
      {contractPriceInfo.price > 0 ? (
        <>
          <div>
            <img
              className={styles.tokenImage}
              src={'oceanToken.png'}
              alt="Coin symbol image"
            />
            <b>{contractPriceInfo.price}</b> / {subscriptionData.duration}h
          </div>
          <Button
            text={`${isBuying ? 'Buying...' : 'Buy'}`}
            type={ButtonType.SECONDARY}
            onClick={() =>
              BuyAction({ currentStatus: subscriptionData.status })
            }
            disabled={!isConnected || isBuying || !isCorrectNetwork}
          />
        </>
      ) : (
        `${contractPriceInfo.alternativeText}`
      )}
    </div>
  )
}
