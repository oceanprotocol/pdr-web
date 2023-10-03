import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useUserContext } from '@/contexts/UserContext'
import { calculateTimeRemaining } from '@/elements/CountdownComponent'
import Tooltip from '@/elements/Tooltip'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { useAccount } from 'wagmi'
import styles from '../styles/SubscriptionDot.module.css'
import { SubscriptionStatus } from './Subscription'

export interface SubscriptionData {
  status: SubscriptionStatus
  assetName: string
  contractAddress: string
  secondsPerSubscription: number
}

export default function SubscriptionDot({
  status,
  assetName,
  contractAddress,
  secondsPerSubscription
}: SubscriptionData) {
  const { address } = useAccount()

  const { getPredictorInstanceByAddress, contractPrices } =
    usePredictoorsContext()
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | undefined>()
  const [message, setMessage] = useState<string>('')
  const [closeToExpiry, setCloseToExpiry] = useState<boolean>(false)
  const { isBuyingSubscription } = useUserContext()

  const userSubscription = () => {
    if (!address || !contractPrices) return
    const predictorInstance = getPredictorInstanceByAddress(contractAddress)
    predictorInstance?.getSubscriptions(address).then((resp) => {
      setExpiryTimestamp(parseInt(ethers.utils.formatUnits(resp.expires, 0)))
    })
  }

  // This function is not really a getter, and a lot of this runs when the sub is not active
  const getTooltipText = () => {
    const timeRemaining = expiryTimestamp
      ? calculateTimeRemaining(expiryTimestamp)
      : 0
    const seconds = Math.floor(timeRemaining / 1000)
    const minutes = Math.floor((timeRemaining / 1000 / 60) % 60)
    const hours = Math.floor((timeRemaining / 1000 / 3600) % 24)

    const isExpiring = seconds < secondsPerSubscription * 0.1
    setCloseToExpiry(isExpiring)
    switch (status) {
      case SubscriptionStatus.FREE:
        return setMessage('Free \n\nSubscription')
      case SubscriptionStatus.ACTIVE:
        return setMessage(
          `Subscribed \n\n ${hours}h ${minutes}min left ${
            isExpiring ? '(<10%)' : ''
          }`
        )
    }
    return ''
  }

  useEffect(() => {
    getTooltipText()
  }, [expiryTimestamp])

  useEffect(() => {
    userSubscription()
  }, [address, contractPrices, status])

  return status !== SubscriptionStatus.INACTIVE || isBuyingSubscription ? (
    <div className={styles.container} id={assetName}>
      <div
        className={styles.image}
        style={{
          backgroundColor:
            isBuyingSubscription == contractAddress ||
            status === SubscriptionStatus.INACTIVE
              ? 'white'
              : status === SubscriptionStatus.ACTIVE && closeToExpiry
              ? 'orange'
              : 'green',
          display:
            isBuyingSubscription == contractAddress ? 'contents' : 'block'
        }}
      >
        {isBuyingSubscription == contractAddress ? (
          <ClipLoader size={12} color="var(--dark-grey)" loading={true} />
        ) : (
          ' '
        )}
      </div>
      {message && (
        <Tooltip selector={assetName} text={message} hideIcon textAlignCenter />
      )}
    </div>
  ) : (
    <></>
  )
}
