import { TokenData, getTokenData } from '@/utils/coin'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSocketContext } from '@/contexts/SocketContext'
import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import { TCoinGeckoIdKeys } from '@/utils/appconstants'
import { TGetAssetPairPriceArgs, getAssetPairPrice } from '@/utils/marketPrices'
import { findContractMarketInConfig } from '@/utils/utils'
import { TAssetData } from './AssetTable'
import Coin from './Coin'
import { EEpochDisplayStatus, EpochDisplay } from './EpochDisplay'
import Price from './Price'
import Subscription from './Subscription'

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

  let { tokenName, pairName, subscription, market } = assetData

  const [fetchedInfo, setFetchedInfo] =
    useState<TAssetRowState['FetchedInfo']>()

  const getAssetPairPriceForRow = useCallback<
    (args: { tokenName: string; pairName: string }) => Promise<string>
  >(
    ({ tokenName, pairName }) =>
      getAssetPairPrice({
        assetPair: `${tokenName}${pairName}`,
        market: findContractMarketInConfig(
          tokenName,
          pairName
        ) as TGetAssetPairPriceArgs['market']
      }),
    []
  )

  const getRemoteData = useCallback<
    (args: {
      tokenName: string
      pairName: string
    }) => Promise<[TokenData, string]>
  >(
    async ({ tokenName, pairName }) =>
      Promise.all([
        getTokenData(tokenName as TCoinGeckoIdKeys),
        getAssetPairPriceForRow({ tokenName, pairName })
      ]),
    []
  )

  const loadData = useCallback<() => Promise<void>>(async () => {
    const [tokenData, price] = await getRemoteData({
      tokenName,
      pairName
    })
    setFetchedInfo({ tokenData, price })
  }, [tokenName, pairName, getRemoteData])

  const renewPrice = useCallback<() => Promise<void>>(async () => {
    const price = await getAssetPairPriceForRow({
      tokenName,
      pairName
    })
    if (price)
      setFetchedInfo((prev) => ({ ...(prev as TAssetFetchedInfo), price }))
  }, [tokenName, pairName, getAssetPairPriceForRow])

  useEffect(() => {
    subscription && loadData()
  }, [loadData])

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
      tokenName && pairName
        ? {
            tokenName,
            pairName,
            subscription
          }
        : null,
    [tokenName, pairName, subscription]
  )

  if (!fetchedInfo || !slotProps) return null

  return (
    <TableRowWrapper
      className={`${styles.tableRow} ${!subscription && styles.unactiveRow}`}
      cellProps={{
        className: styles.tableRowCell
      }}
    >
      <Coin coinData={fetchedInfo.tokenData} />
      <Price coinData={fetchedInfo.tokenData} />
      <EpochDisplay
        status={EEpochDisplayStatus.NextPrediction}
        {...slotProps}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.LivePrediction}
        {...slotProps}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.HistoricalPrediction}
        {...slotProps}
      />
      <Subscription
        subscriptionData={{
          price: 3,
          status: subscription,
          assetDid: ''
        }}
      />
    </TableRowWrapper>
  )
}
