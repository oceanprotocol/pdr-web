import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import { assetTableColumns, currentConfig } from '@/utils/appconstants'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { AssetRow } from './AssetRow'
import { SubscriptionStatus } from './Subscription'

export type TAssetData = {
  tokenName: string
  pairName: string
  market: string
  interval: string
  contract: TPredictionContract
  subscription: SubscriptionStatus
  subscriptionPrice: string
  subscriptionDuration: number
}

export type TAssetTableProps = {
  //contracts: TPredictionContract[]
  contracts: Record<string, TPredictionContract>
}

export type TAssetTableState = {
  AssetsData: Array<TAssetData>
}

export const AssetTable: React.FC<TAssetTableProps> = ({ contracts }) => {
  const { subscribedPredictoors } = usePredictoorsContext()
  const [assetsData, setAssetsData] = useState<TAssetTableState['AssetsData']>(
    []
  )

  const subscribedContractAddresses = useMemo(
    () => subscribedPredictoors.map((contract) => contract.address),
    [subscribedPredictoors]
  )

  const getSubscriptionStatus = useCallback<
    (contract: TPredictionContract) => SubscriptionStatus
  >(
    (contract) => {
      if (subscribedContractAddresses.includes(contract.address)) {
        return SubscriptionStatus.ACTIVE
      }
      if (currentConfig.opfProvidedPredictions.includes(contract.address)) {
        return SubscriptionStatus.FREE
      }
      return SubscriptionStatus.INACTIVE
    },
    [subscribedContractAddresses]
  )

  const prepareAssetData = useCallback<
    (contracts: Record<string, TPredictionContract>) => void
  >(
    (contracts) => {
      const assetsData: TAssetTableState['AssetsData'] = []

      Object.entries(contracts).forEach(([, contract]) => {
        const [tokenName, pairName] = contract.name.split('-')

        const subscriptionPrice = contract.price
        const market = contract.market
        const interval = contract.interval
        const subscriptionStatus = getSubscriptionStatus(contract)
        const subscriptionDuration =
          parseInt(contract.blocksPerSubscription) / 3600

        assetsData.push({
          tokenName,
          pairName,
          contract,
          market,
          interval,
          subscriptionPrice,
          subscriptionDuration,
          subscription: subscriptionStatus
        })
      })
      setAssetsData(assetsData)
    },
    [getSubscriptionStatus]
  )

  useEffect(() => {
    if (!contracts || !prepareAssetData) return
    prepareAssetData(contracts)
  }, [contracts, prepareAssetData])

  return (
    <table className={styles.table}>
      <thead>
        <TableRowWrapper
          className={styles.tableRow}
          cellProps={{
            className: styles.tableHeaderCell
          }}
          cellType="th"
        >
          {assetTableColumns.map((item) => (
            <span key={`assetHeader${item.accessor}`}>{item.Header}</span>
          ))}
        </TableRowWrapper>
      </thead>
      <tbody>
        {assetsData.map((item) => (
          <AssetRow key={`assetRow${item.contract.address}`} assetData={item} />
        ))}
      </tbody>
    </table>
  )
}
