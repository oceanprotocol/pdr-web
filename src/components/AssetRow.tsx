import { TokenData } from '@/utils/asset'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useSocketContext } from '@/contexts/SocketContext'
import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import { getAssetPairPrice } from '@/utils/marketPrices'
import Accuracy from './Accuracy'
import Asset from './Asset'
import { TAssetData } from './AssetTable'
import { EEpochDisplayStatus, EpochDisplay } from './EpochDisplay'
import Price from './Price'
import Subscription, { SubscriptionStatus } from './Subscription'

export type TAssetFetchedInfo = {
  tokenData: TokenData | undefined
  price: string
}

export type TAssetRowProps = {
  assetData: TAssetData
}

export type TAssetRowState = {
  FetchedInfo: TAssetFetchedInfo | undefined
}

export const AssetRow: React.FC<TAssetRowProps> = ({ assetData }) => {
  const { epochData } = useSocketContext()
  const [tokenData, setTokenData] = useState<TokenData>({
    name: '--',
    symbol: '--',
    price: 0,
    accuracy: 0.0,
    market: ''
  })
  const {
    tokenName,
    pairName,
    subscription,
    subscriptionPrice,
    subscriptionDuration,
    market,
    baseToken,
    quoteToken,
    interval,
    contract
  } = assetData
  const { contractAverages } = usePredictoorsContext()

  const getAssetPairPriceForRow = useCallback<
    (args: {
      tokenName: string
      pairName: string
      timestamp?: number
      market: string
    }) => Promise<string>
  >(
    ({ tokenName, pairName, timestamp }) =>
      getAssetPairPrice({
        assetPair: `${tokenName}${pairName}`,
        timestamp: timestamp,
        market: market
      }),
    []
  )

  const loadData = async () => {
    const price = await getAssetPairPriceForRow({
      tokenName,
      pairName,
      market
    })

    // console.log("address:", contract.address)
    // const average = contractAverages[contract.address];
    // console.log("average:", average)
    
    const name = `${interval.toLocaleLowerCase()}-${baseToken}/${quoteToken}`
    setTokenData({
      price: parseFloat(price),
      accuracy: 0.0,
      name,
      symbol: baseToken,
      market: market
    })
  }

  const renewPrice = useCallback<() => Promise<void>>(async () => {
    loadData()
  }, [tokenName, pairName, getAssetPairPriceForRow])

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
    loadData()
  }, [])

  if (!tokenData || !slotProps) return null

  return (
    <TableRowWrapper
      className={`${styles.tableRow} ${
        subscription == SubscriptionStatus.INACTIVE && styles.inactiveRow
      }`}
      cellProps={{
        className: styles.tableRowCell
      }}
    >
      <Asset assetData={tokenData} />
      <Price assetData={tokenData} />
      <Accuracy assetData={tokenData} />
      <EpochDisplay
        status={EEpochDisplayStatus.NextPrediction}
        price={tokenData.price}
        {...slotProps}
        subsciption={subscription}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.LivePrediction}
        price={tokenData.price}
        {...slotProps}
        subsciption={subscription}
      />
      <div className={styles.historyEpochsContainer}>
        <EpochDisplay
          status={EEpochDisplayStatus.HistoricalPrediction}
          historyIndex={1}
          price={tokenData.price}
          {...slotProps}
          subsciption={subscription}
        />
        <EpochDisplay
          status={EEpochDisplayStatus.HistoricalPrediction}
          historyIndex={0}
          price={tokenData.price}
          {...slotProps}
          subsciption={subscription}
        />
      </div>
      <Subscription
        subscriptionData={{
          price: parseInt(subscriptionPrice),
          status: subscription,
          duration: subscriptionDuration
        }}
        contractAddress={contract.address}
      />
    </TableRowWrapper>
  )
}
