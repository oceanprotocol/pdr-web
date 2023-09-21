import { TokenData } from '@/utils/asset'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
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
  const { currentEpoch, secondsPerEpoch } = usePredictoorsContext()
  const [tokenData, setTokenData] = useState<TokenData>({
    name: '',
    symbol: '',
    pair: '',
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

  const lastEpochTimestamp = useRef<number>(currentEpoch)

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
    (args: { contract: string; lastSlotTS: number }) => Promise<number>
  >(async ({ contract, lastSlotTS }) => {
    if (!lastSlotTS) return 0

    const accuracyRecord = await calculateAverageAccuracy(
      currentConfig.subgraph,
      [contract],
      lastSlotTS
    )
    return accuracyRecord[contract]
  }, [])

  const loadData = async () => {
    const price = await getAssetPairPriceForRow({
      tokenName,
      pairName,
      market
    })
    const pair = `${baseToken}${quoteToken}`
    const name = `${baseToken}-${quoteToken}`
    setTokenData({
      price: parseFloat(price),
      name,
      pair,
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
  const loadAccuracy = useCallback(async () => {
    let accuracy = await getAssetPairAccuracyForRow({
      contract: contract.address,
      lastSlotTS: currentEpoch
    })

    setTokenAccuracy(accuracy)
  }, [getAssetPairAccuracyForRow, currentEpoch, contract.address])

  useEffect(() => {
    loadAccuracy()
  }, [loadAccuracy])

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
      className={styles.tableRow}
      cellProps={{
        className: styles.tableRowCell
      }}
    >
      <Asset
        assetData={tokenData}
        contractAddress={contract.address}
        subscription={subscription}
        secondsPerSubscription={assetData.subscriptionDuration}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.PastEpoch}
        price={tokenData.price}
        {...slotProps}
        subscription={subscription}
        epochStartTs={currentEpoch - secondsPerEpoch}
        secondsPerEpoch={secondsPerEpoch}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.LiveEpoch}
        price={tokenData.price}
        {...slotProps}
        epochStartTs={currentEpoch}
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
          epochStartTs={currentEpoch + secondsPerEpoch}
          secondsPerEpoch={secondsPerEpoch}
        />
      ) : (
        <Subscription
          subscriptionData={{
            price: parseInt(subscriptionPrice),
            status: subscription,
            duration: subscriptionDuration
          }}
          contractAddress={contract.address}
        />
      )}
      <Accuracy accuracy={tokenAccuracy} />
    </TableRowWrapper>
  )
}
