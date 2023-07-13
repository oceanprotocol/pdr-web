import React, { useEffect, useState } from 'react'

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

  const prepareAssetData = (contracts: Record<string, TPredictionContract>) => {
    const assetsData: TAssetTableState['AssetsData'] = []

    Object.entries(contracts).forEach(([, contract]) => {
      const [tokenName, pairName] = contract.name.split('-')
      let subscription = SubscriptionStatus.ACTIVE

      assetsData.push({ tokenName, pairName, contract, subscription })
    })
    assetsData[2].subscription = SubscriptionStatus.INACTIVE
    assetsData[1].subscription = SubscriptionStatus.ACTIVE
    assetsData[0].subscription = SubscriptionStatus.ACTIVE
    setAssetsData(assetsData)
  }

  useEffect(() => {
    prepareAssetData(contracts)
  }, [contracts])

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
