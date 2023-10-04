import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { TPredictoorsContext } from '@/contexts/PredictoorsContext.types'
import { useUserContext } from '@/contexts/UserContext'
import Button, { ButtonType } from '@/elements/Button'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useIsCorrectChain } from '@/hooks/useIsCorrectChain'
import { NonError, ValueOf, sleep } from '@/utils/utils'
import { useCallback, useMemo } from 'react'
import { NotificationManager } from 'react-notifications'
import { ClipLoader } from 'react-spinners'
import { useAccount } from 'wagmi'
import styles from '../styles/Subscription.module.css'

export enum SubscriptionStatus {
  'INACTIVE' = 'inactive',
  'ACTIVE' = 'active',
  'FREE' = 'FREE'
}

export interface SubscriptionData {
  status: SubscriptionStatus
  secondsPerSubscription: number
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
  const { refetchBalance, isBuyingSubscription, setIsBuyingSubscription } =
    useUserContext()
  const signer = useEthersSigner({})
  const { isCorrectNetwork } = useIsCorrectChain()

  const { getPredictorInstanceByAddress, runCheckContracts, contractPrices } =
    usePredictoorsContext()

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
        setIsBuyingSubscription(contractAddress)

        if (!signer) return
        const receipt = await predictorInstance.buyAndStartSubscription(signer)

        await sleep(1000)

        if (!!receipt) {
          runCheckContracts()
        }
        refetchBalance()
        setIsBuyingSubscription('')
        NotificationManager.success(
          '',
          'Subscription purchase succesful!',
          5000
        )
      } catch (e: any) {
        console.error(e)
        setIsBuyingSubscription('')
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
          <div className={styles.priceContent}>
            <img
              className={styles.tokenImage}
              src={'oceanToken.png'}
              alt="Coin symbol image"
            />
            <b>{contractPriceInfo.price}</b> /{' '}
            {subscriptionData.secondsPerSubscription / 3600}h
          </div>
          <Button
            text={`${
              isBuyingSubscription == contractAddress ? 'Buying...' : 'Buy'
            }`}
            type={ButtonType.SECONDARY}
            onClick={() =>
              BuyAction({ currentStatus: subscriptionData.status })
            }
            disabled={
              !isConnected || isBuyingSubscription !== '' || !isCorrectNetwork
            }
          />
        </>
      ) : (
        <ClipLoader size={12} color="var(--dark-grey)" loading={true} />
      )}
    </div>
  )
}
