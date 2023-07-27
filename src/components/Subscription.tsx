import Button from '@/elements/Button'
import Predictoor from '@/utils/contracts/Predictoor'
import { useCallback } from 'react'
import { useAccount } from 'wagmi'
import styles from '../styles/Subscription.module.css'

export enum SubscriptionStatus {
  'INACTIVE' = 'inactive',
  'ACTIVE' = 'active',
  'FREE' = 'free'
}

export interface SubscriptionData {
  status: SubscriptionStatus
  assetDid: string
  price: number
}

const redirectToMarketplace = (did: string) => {
  const url = `https://market.oceanprotocol.com/asset/${did}`
  window.open(url, '_blank', 'noreferrer')
}

export default function Subscription({
  subscriptionData
}: {
  subscriptionData: SubscriptionData | undefined
}) {
  const { isConnected } = useAccount()

  const BuyAction = useCallback<
    (args: { currentStatus: SubscriptionStatus }) => void
  >(
    ({ currentStatus }) => {
      if (!isConnected || currentStatus !== SubscriptionStatus.INACTIVE) return

      const predictoor = new Predictoor(
        contract.address,
        networkProvider.getProvider()
      )
      await predictoor.init()
    },
    [isConnected]
  )

  if (!subscriptionData) return null

  return (
    <div className={styles.container}>
      <span className={styles.price}>
        {subscriptionData.price > 0
          ? `${subscriptionData.price} OCEAN`
          : 'FREE'}
      </span>
      {subscriptionData.status === SubscriptionStatus.INACTIVE ? (
        <Button
          text="BUY"
          onClick={() => redirectToMarketplace(subscriptionData.assetDid)}
          disabled={!isConnected}
        />
      ) : (
        <span className={styles.status}>{subscriptionData.status}</span>
      )}
    </div>
  )
}
