import { TokenData } from '@/utils/asset'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { Pair } from '@/contexts/MarketPriceContext.types'
import { getSpecificPairFromContextData } from '@/contexts/MarketPriceContextHelpers'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useSocketContext } from '@/contexts/SocketContext'
import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import { Maybe } from '@/utils/utils'
import Accuracy from './Accuracy'
import Asset from './Asset'
import { TAssetData } from './AssetTable'
import { EEpochDisplayStatus, EpochDisplay } from './EpochDisplay'
import Price from './Price'
import Stake from './Stake'
import Subscription, { SubscriptionStatus } from './Subscription'

export type TAssetFetchedInfo = {
  tokenData: TokenData | undefined
  price: string
}

export type TAccuracyDataForAsset = {
  accuracy: number
  totalStakeToday: number
  totalStakeYesterday: number
}

export type TAssetRowProps = {
  assetData: TAssetData
  accuracyData: Maybe<TAccuracyDataForAsset>
}

export type TAssetRowState = {
  FetchedInfo: TAssetFetchedInfo | undefined
}

export const AssetRow: React.FC<TAssetRowProps> = ({
  assetData,
  accuracyData
}) => {
  const { epochData } = useSocketContext()

  const { currentEpoch, secondsPerEpoch } = usePredictoorsContext()
  const [tokenData, setTokenData] = useState<TokenData>({
    name: '',
    symbol: '',
    pair: '',
    price: 0,
    market: ''
  })
  const { allPairsData } = useMarketPriceContext()

  const {
    tokenName,
    pairName,
    subscription,
    subscriptionPrice,
    secondsPerSubscription,
    market,
    baseToken,
    quoteToken,
    //interval,
    contract
  } = assetData

  const loadData = useCallback<(pairsData: Array<Pair>) => void>(
    (pairsData) => {
      const pairSymbol = `${baseToken}${quoteToken}`

      const price = getSpecificPairFromContextData({
        allPairsData: pairsData,
        pairSymbol: pairSymbol
      })

      const name = `${baseToken}-${quoteToken}`
      setTokenData({
        price: parseFloat(price),
        name,
        pair: pairSymbol,
        symbol: baseToken,
        market: market
      })
    },
    [baseToken, market, quoteToken]
  )

  const renewPrice = useCallback<() => Promise<void>>(async () => {
    if (!allPairsData) return
    loadData(allPairsData)
  }, [allPairsData, loadData])

  useEffect(() => {
    const priceInterval = setInterval(() => {
      renewPrice()
    }, 10000)

    return () => {
      clearInterval(priceInterval)
    }
  }, [epochData, renewPrice])

  const slotProps = useMemo(
    () =>
      tokenName && pairName && subscription
        ? {
            tokenName,
            pairName,
            subscription,
            market
          }
        : null,
    [tokenName, pairName, subscription]
  )

  useEffect(() => {
    if (!allPairsData) return
    //loadAccuracy()
    loadData(allPairsData)
  }, [allPairsData, loadData])

  if (!tokenData || !slotProps) return null

  return (
    <TableRowWrapper
      className={styles.tableRow}
      cellProps={{
        className: styles.tableRowCell
      }}
    >
      <Asset
        assetData={tokenData}
        contractAddress={contract.address}
        subscription={subscription}
        secondsPerSubscription={assetData.secondsPerSubscription}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.PastEpoch}
        price={tokenData.price}
        {...slotProps}
        subscription={subscription}
        address={contract.address}
        epochStartTs={currentEpoch - secondsPerEpoch}
        secondsPerEpoch={secondsPerEpoch}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.LiveEpoch}
        price={tokenData.price}
        {...slotProps}
        epochStartTs={currentEpoch}
        address={contract.address}
        subscription={subscription}
        secondsPerEpoch={secondsPerEpoch}
      />
      <Price assetData={tokenData} />
      {subscription !== SubscriptionStatus.INACTIVE ? (
        <EpochDisplay
          status={EEpochDisplayStatus.NextEpoch}
          price={tokenData.price}
          {...slotProps}
          subscription={subscription}
          address={contract.address}
          epochStartTs={currentEpoch + secondsPerEpoch}
          secondsPerEpoch={secondsPerEpoch}
        />
      ) : (
        <Subscription
          subscriptionData={{
            price: parseInt(subscriptionPrice),
            status: subscription,
            secondsPerSubscription: secondsPerSubscription
          }}
          contractAddress={contract.address}
        />
      )}
      <Accuracy accuracy={accuracyData?.accuracy ?? null} />
      <Stake
        totalStake={accuracyData?.totalStakeToday ?? 0}
        totalStakePreviousDay={accuracyData?.totalStakeYesterday ?? 0}
      />
    </TableRowWrapper>
  )
}
