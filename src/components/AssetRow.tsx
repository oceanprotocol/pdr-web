import { TokenData } from '@/utils/asset'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSocketContext } from '@/contexts/SocketContext'
import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import { currentConfig } from '@/utils/appconstants'
import { getAssetPairPrice } from '@/utils/marketPrices'
import { calculateAverageAccuracy } from '@/utils/subgraphs/getAssetAccuracy'
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
  const [tokenAccuracy, setTokenAccuracy] = useState<number>(0.0)
  const [tokenData, setTokenData] = useState<TokenData>({
    name: '--',
    symbol: '--',
    price: 0,
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

  const getAssetPairAccuracyForRow = useCallback<
    (args: {
      contract: string
    }) => Promise<number>
  >(
    ({ contract }) =>
      calculateAverageAccuracy(
        currentConfig.subgraph,
        contract
      ),
    []
  )

  const loadData = async () => {
    const price = await getAssetPairPriceForRow({
      tokenName,
      pairName,
      market
    })

    const name = `${interval.toLocaleLowerCase()}-${baseToken}/${quoteToken}`
    setTokenData({
      price: parseFloat(price),
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

  // Calculate accuracy and set state
  const loadAccuracy = async () => {
    let accuracy = await getAssetPairAccuracyForRow({
      contract: contract.address
    })
    accuracy = accuracy > 0.0 ? parseFloat(accuracy.toFixed(2)) : 0.0;
    setTokenAccuracy(accuracy)
  }

  // Accuracy update interval
  const renewAccuracy = useCallback<() => Promise<void>>(async () => {
    loadAccuracy()
  }, [tokenName, pairName, getAssetPairAccuracyForRow])

  const kACCURACY_INTERVAL = 1000 * 3600;
  useEffect(() => {
    const accuracyInterval = setInterval(() => {
      renewAccuracy()
    }, kACCURACY_INTERVAL)

    return () => {
      clearInterval(accuracyInterval)
    }
  }, [epochData, renewAccuracy])

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
    loadAccuracy()
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
      <Accuracy accuracy={tokenAccuracy} />
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
