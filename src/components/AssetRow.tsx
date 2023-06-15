import { TokenData, getTokenData } from '@/utils/coin'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Slot, { SlotState } from './Slot'

import { useContractsContext } from '@/contexts/ContractsContext'
import { useOPFContext } from '@/contexts/OPFContext'
import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import { TCoinGeckoIdKeys } from '@/utils/appconstants'
import Predictoor from '@/utils/contracts/Predictoor'
import { TGetAssetPairPriceArgs, getAssetPairPrice } from '@/utils/marketPrices'
import { TPredictionContract } from '@/utils/subgraph'
import { findContractMarketInConfig } from '@/utils/utils'
import AmountInput from './AmountInput'
import { TAssetData } from './AssetList'
import Coin from './Coin'

export type TAssetFetchedInfo = {
  tokenData: TokenData
  price: string
  predictoor: Predictoor
}

export type TAssetRowProps = {
  assetData: TAssetData
}

export type TAssetRowState = {
  FetchedInfo: TAssetFetchedInfo | undefined
}

export const AssetRow: React.FC<TAssetRowProps> = ({ assetData }) => {
  const { tokenName, pairName, contract } = assetData
  const { data, addContract } = useContractsContext()
  const { provider } = useOPFContext()

  const [fetchedInfo, setFetchedInfo] =
    useState<TAssetRowState['FetchedInfo']>()

  const checkOrAddContract = useCallback<
    (contract: TPredictionContract) => Promise<Predictoor>
  >(
    async (contract) => {
      const predictor = data[contract.address]
      if (!predictor) {
        return await addContract(contract.address, provider, contract.address)
      }
      return predictor
    },
    [data, provider, addContract]
  )

  const getRemoteData = useCallback<
    (args: {
      tokenName: string
      pairName: string
      contract: TPredictionContract
    }) => Promise<[TokenData, string, Predictoor]>
  >(
    async ({ tokenName, pairName, contract }) =>
      Promise.all([
        getTokenData(tokenName as TCoinGeckoIdKeys),
        getAssetPairPrice({
          assetPair: `${tokenName}${pairName}`,
          exchange: findContractMarketInConfig(
            tokenName,
            pairName
          ) as TGetAssetPairPriceArgs['exchange']
        }),
        checkOrAddContract(contract)
      ]),
    [checkOrAddContract]
  )

  const loadData = useCallback<() => Promise<void>>(async () => {
    const [tokenData, price, predictoor] = await getRemoteData({
      tokenName,
      pairName,
      contract
    })
    setFetchedInfo({ tokenData, price, predictoor })
  }, [tokenName, pairName, contract, getRemoteData])

  useEffect(() => {
    loadData()
  }, [loadData])

  const slotProps = useMemo(
    () =>
      fetchedInfo
        ? {
            predictoor: fetchedInfo?.predictoor,
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
      <AmountInput />
      <Slot state={SlotState.NextPrediction} epochOffset={+1} {...slotProps} />
      <Slot state={SlotState.NextPrediction} epochOffset={+1} {...slotProps} />
      <Slot
        state={SlotState.HistoricalPrediction}
        epochOffset={-1}
        {...slotProps}
      />
    </TableRowWrapper>
  )
}
