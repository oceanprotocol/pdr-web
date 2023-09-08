import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { tooltipOptions, tooltipsText } from '../metadata/tootltips'

import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import LiveTime from '@/elements/LiveTime'
import { TableRowWrapper } from '@/elements/TableRowWrapper'
import Tooltip from '@/elements/Tooltip'
import styles from '@/styles/Table.module.css'
import {
  assetTableColumns,
  currentConfig,
  formatTime
} from '@/utils/appconstants'
import { splitContractName } from '@/utils/splitContractName'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { AssetRow } from './AssetRow'
import { SubscriptionStatus } from './Subscription'

export type TAssetData = {
  tokenName: string
  pairName: string
  market: string
  baseToken: string
  quoteToken: string
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
  const { subscribedPredictoors, currentEpoch, secondsPerEpoch } =
    usePredictoorsContext()
  const [tableColumns, setTableColumns] = useState<any>(assetTableColumns)
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

      // Iterate over each contract
      Object.entries(contracts).forEach(([, contract]) => {
        // Split contract name into token name and pair name
        const [tokenName, pairName] = splitContractName(contract.name)

        // Get subscription status and duration
        const subscriptionStatus = getSubscriptionStatus(contract)
        const subscriptionDuration =
          parseInt(contract.secondsPerSubscription) / 3600

        // Create an object with the required data and push it to the assetsData array

        assetsData.push({
          tokenName,
          pairName,
          contract,
          market: contract.market,
          baseToken: contract.baseToken,
          quoteToken: contract.quoteToken,
          subscriptionPrice: contract.price,
          interval: contract.interval,
          subscriptionDuration,
          subscription: subscriptionStatus
        })
      })

      const privilegedTokens = ['BTC', 'ETH']

      assetsData.sort((a, b) => {
        if (a.subscription === SubscriptionStatus.FREE) return -1
        if (b.subscription === SubscriptionStatus.FREE) return 1
        if (a.subscription === SubscriptionStatus.ACTIVE) return -1
        if (b.subscription === SubscriptionStatus.ACTIVE) return 1
        for (const token of privilegedTokens) {
          if (a.tokenName === token) return -1
          if (b.tokenName === token) return 1
        }
        return a.tokenName.toUpperCase().charCodeAt(0)
      })

      // Update the state with the assetsData array
      setAssetsData(assetsData)
    },
    [getSubscriptionStatus]
  )

  useEffect(() => {
    if (!contracts || !prepareAssetData) return
    prepareAssetData(contracts)
  }, [contracts, prepareAssetData])

  useEffect(() => {
    if (!currentEpoch) return
    let newAssetTableColumns = JSON.parse(JSON.stringify(assetTableColumns))
    newAssetTableColumns[1].Header = formatTime(
      new Date((currentEpoch - secondsPerEpoch) * 1000)
    )
    newAssetTableColumns[2].Header = formatTime(new Date(currentEpoch * 1000))
    newAssetTableColumns[3].Header = <LiveTime />
    newAssetTableColumns[4].Header = (
      <div className={styles.predictionHeader}>
        <span>
          {formatTime(new Date((currentEpoch + secondsPerEpoch) * 1000))}
        </span>
        <span className={styles.predictionText}>Predictions</span>
      </div>
    )
    newAssetTableColumns[5].Header = (
      <div>
        Accuracy
        <span className={styles.greyText}>{` 24h`}</span>
      </div>
    )
    setTableColumns(newAssetTableColumns)
  }, [currentEpoch])

  return (
    tableColumns && (
      <table className={styles.table}>
        <thead>
          <TableRowWrapper
            className={styles.tableRow}
            cellProps={{
              className: styles.tableHeaderCell
            }}
            cellType="th"
          >
            {tableColumns.map((item: any) => (
              <div
                className={styles.assetHeaderContainer}
                key={`assetHeader${item.accessor}`}
              >
                <span>{item.Header}</span>
                <Tooltip
                  selector={item.accessor}
                  text={
                    tooltipsText[item.Header as keyof typeof tooltipOptions]
                  }
                />
              </div>
            ))}
          </TableRowWrapper>
        </thead>
        {assetsData.length > 0 ? (
          <tbody>
            {assetsData.map((item) => (
              <AssetRow
                key={`assetRow${item.contract.address}`}
                assetData={item}
              />
            ))}
          </tbody>
        ) : (
          <tbody className={styles.message}>
            <tr>
              <td>No contracts found</td>
            </tr>
          </tbody>
        )}
      </table>
    )
  )
}
