import React, { useEffect, useState } from 'react'

import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import { assetTableColumns } from '@/utils/appconstants'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { AssetRow } from './AssetRow'

export type TAssetData = {
  tokenName: string
  pairName: string
  contract: TPredictionContract
}

export type TAssetListProps = {
  contracts: Record<string, TPredictionContract>
}

export type TAssetListState = {
  AssetsData: Array<TAssetData>
}

export const AssetList: React.FC<TAssetListProps> = ({ contracts }) => {
  const [assetsData, setAssetsData] = useState<TAssetListState['AssetsData']>(
    []
  )

  const prepareAssetData = (contracts: Record<string, TPredictionContract>) => {
    const assetsData: TAssetListState['AssetsData'] = []

    Object.entries(contracts).forEach(([, contract]) => {
      const [tokenName, pairName] = contract.name.split('-')

      assetsData.push({ tokenName, pairName, contract })
    })
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
