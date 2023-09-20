import Image from 'next/image'
import styles from '../styles/Asset.module.css'
import { TokenData } from '../utils/asset'
import { SubscriptionStatus } from './Subscription'
import SubscriptionDot from './SubscriptionDot'

export enum Markets {
  'BINANCE' = 'binance',
  'KRAKEN' = 'kraken'
}

export default function Asset({
  assetData,
  contractAddress,
  subscription
}: {
  assetData: TokenData | undefined
  contractAddress: string
  subscription: SubscriptionStatus
}) {
  if (!assetData) return null

  return (
    <div className={styles.container}>
      <SubscriptionDot
        status={subscription}
        assetName={assetData.name}
        contractAddress={contractAddress}
      />
      <img
        className={styles.image}
        src={`/assets/icons/${assetData.symbol}.svg`}
        alt="Coin symbol image"
      />
      <div className={styles.assetInfoContainer}>
        <span className={styles.assetName}>{assetData.name}</span>
        <div className={styles.marketInfoContainer}>
          <Image
            src={
              assetData.market == Markets.BINANCE
                ? '/binance-logo.png'
                : '/kraken-logo.png'
            }
            alt="marketLogo"
            width={9}
            height={9}
          />
          <span className={styles.marketText}>
            {assetData.market.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}
