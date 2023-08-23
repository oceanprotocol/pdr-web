import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { TPredictoorsContext } from '@/contexts/PredictoorsContext.types'
import { useUserContext } from '@/contexts/UserContext'
import Button from '@/elements/Button'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { currentConfig } from '@/utils/appconstants'
import { NonError, ValueOf } from '@/utils/utils'
import { useCallback, useMemo, useState } from 'react'
import { NotificationManager } from 'react-notifications'
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

type TContractPriceInfo = {
  price: NonError<NonNullable<ValueOf<TPredictoorsContext['contractPrices']>>>
  alternativeText?: string
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

  const { getPredictorInstanceByAddress, runCheckContracts, contractPrices } =
    usePredictoorsContext()
  const [isBuying, setIsBuying] = useState(false)

  const contractPriceInfo: TContractPriceInfo = useMemo(() => {
    const loadingResult = {
      price: 0,
      // duration: 0,
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
        NotificationManager.success(
          '',
          'Subscription purchase succesful!',
          5000
        )
      } catch (e: any) {
        console.error(e)
        console.log(e)
        setIsBuying(false)
        NotificationManager.error(e, 'Subscription purchase failed!', 5000)
      }
    },
    [isConnected, address, getPredictorInstanceByAddress, contractAddress]
  )

  if (!subscriptionData) return null

  return (
    <div className={styles.container}>
      <span className={styles.price}>
        {contractPriceInfo.price > 0 ? (
          <div>
            <img
              className={styles.tokenImage}
              src={'oceanToken.png'}
              alt="Coin symbol image"
            />
            <b>{contractPriceInfo.price}</b> / {subscriptionData.duration}h
          </div>
        ) : (
          `${
            contractPriceInfo.price
              ? contractPriceInfo.alternativeText
                ? contractPriceInfo.alternativeText
                : 'FREE'
              : contractPriceInfo.alternativeText
          }`
        )}
      </span>

      {subscriptionData.status === SubscriptionStatus.INACTIVE &&
        !!contractPriceInfo.price && (
          <Button
            text={`${isBuying ? 'Buying...' : 'Buy'}`}
            onClick={() =>
              BuyAction({ currentStatus: subscriptionData.status })
            }
            disabled={
              !isConnected || isBuying || chain?.id !== parseInt(chainId)
            }
          />
        )}

      {[SubscriptionStatus.ACTIVE, SubscriptionStatus.FREE].includes(
        subscriptionData.status
      ) &&
        contractPriceInfo.price > 0 && (
          <span className={styles.status}>{subscriptionData.status}</span>
        )}
    </div>
  )
}
