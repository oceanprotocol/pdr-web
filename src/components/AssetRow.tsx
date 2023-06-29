import { TokenData, getTokenData } from '@/utils/coin'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import { TCoinGeckoIdKeys } from '@/utils/appconstants'
import { TGetAssetPairPriceArgs, getAssetPairPrice } from '@/utils/marketPrices'
import { findContractMarketInConfig } from '@/utils/utils'
import { TAssetData } from './AssetList'
import Coin from './Coin'
import { EEpochDisplayStatus, EpochDisplay } from './EpochDisplay'

export type TAssetFetchedInfo = {
  tokenData: TokenData
  price: string
}

export type TAssetRowProps = {
  assetData: TAssetData
}

export type TAssetRowState = {
  FetchedInfo: TAssetFetchedInfo | undefined
}

export const AssetRow: React.FC<TAssetRowProps> = ({ assetData }) => {
  const { tokenName, pairName } = assetData

  const [fetchedInfo, setFetchedInfo] =
    useState<TAssetRowState['FetchedInfo']>()

  const getRemoteData = useCallback<
    (args: {
      tokenName: string
      pairName: string
    }) => Promise<[TokenData, string]>
  >(
    async ({ tokenName, pairName }) =>
      Promise.all([
        getTokenData(tokenName as TCoinGeckoIdKeys),
        getAssetPairPrice({
          assetPair: `${tokenName}${pairName}`,
          exchange: findContractMarketInConfig(
            tokenName,
            pairName
          ) as TGetAssetPairPriceArgs['exchange']
        })
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

  useEffect(() => {
    loadData()
  }, [loadData])

  const slotProps = useMemo(
    () =>
      fetchedInfo
        ? {
            tokenName,
            pairName
          }
        : null,
    [fetchedInfo, tokenName, pairName]
  )

  if (!fetchedInfo || !slotProps) return null

  return (
    <TableRowWrapper
      className={styles.tableRow}
      cellProps={{
        className: styles.tableRowCell
      }}
    >
      <Coin coinData={fetchedInfo.tokenData} />
      <>{`$${parseFloat(fetchedInfo.price).toFixed(2)}`}</>
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
    </TableRowWrapper>
  )
}
