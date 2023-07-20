import React, { useCallback, useEffect, useState } from 'react'

import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import { assetTableColumns } from '@/utils/appconstants'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { AssetRow } from './AssetRow'
import { SubscriptionStatus } from './Subscription'

export type TAssetData = {
  tokenName: string
  pairName: string
  contract: TPredictionContract
  subscription: SubscriptionStatus
}

export type TAssetTableProps = {
  contracts: Record<string, TPredictionContract>
}

export type TAssetTableState = {
  AssetsData: Array<TAssetData>
}

export const AssetTable: React.FC<TAssetTableProps> = ({ contracts }) => {
  const [assetsData, setAssetsData] = useState<TAssetTableState['AssetsData']>(
    []
  )

  const getSubscriptionStatus = useCallback<
    (contract: TPredictionContract) => SubscriptionStatus
  >(
    (contract) => {
      return SubscriptionStatus.ACTIVE
      /*if (subscribedContractAddresses.includes(contract.address)) {
        return SubscriptionStatus.ACTIVE
      }
      if (currentConfig.opfProvidedPredictions.includes(contract.address)) {
        return SubscriptionStatus.FREE
      }
      return SubscriptionStatus.INACTIVE*/
    },
    [contracts]
  )

  const prepareAssetData = useCallback<
    (contracts: Record<string, TPredictionContract>) => void
  >(
    (contracts) => {
      const assetsData: TAssetTableState['AssetsData'] = []

      Object.entries(contracts).forEach(([, contract]) => {
        const [tokenName, pairName] = contract.name.split('-')

        const subscriptionStatus = getSubscriptionStatus(contract)

        assetsData.push({
          tokenName,
          pairName,
          contract,
          subscription: subscriptionStatus
        })
      })
      console.log(assetsData)
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
