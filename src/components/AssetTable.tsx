import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { tooltipsText } from '../metadata/tootltips'

import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useTimeFrameContext } from '@/contexts/TimeFrameContext'
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
import { EPredictoorContractInterval } from '@/utils/types/EPredictoorContractInterval'
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
  secondsPerSubscription: number
}

export type TAssetTableProps = {
  //contracts: TPredictionContract[]
  contracts: Record<string, TPredictionContract> | undefined
}

export type TAssetTableState = {
  AssetsData: Array<TAssetData>
}

export const AssetTable: React.FC<TAssetTableProps> = ({ contracts }) => {
  const { subscribedPredictoors, currentEpoch, secondsPerEpoch } =
    usePredictoorsContext()

  const { fetchAndCacheAllPairs } = useMarketPriceContext()

  const [tableColumns, setTableColumns] = useState<any>(assetTableColumns)
  const [assetsData, setAssetsData] = useState<TAssetTableState['AssetsData']>()
  const { timeFrameInterval } = useTimeFrameContext()
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

        // Get subscription status
        const subscriptionStatus = getSubscriptionStatus(contract)

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
          secondsPerSubscription: parseInt(contract.secondsPerSubscription),
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

  const getThowLinesHeader = (
    firstLineText: string,
    secondLineText: string
  ) => {
    return (
      <div className={styles.displayColumn}>
        {firstLineText}
        <span className={styles.headerTextSmall}>{secondLineText}</span>
      </div>
    )
  }

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
    newAssetTableColumns[4].Header = getThowLinesHeader(
      formatTime(new Date((currentEpoch + secondsPerEpoch) * 1000)),
      'Predictions'
    )
    newAssetTableColumns[5].Header = getThowLinesHeader(
      newAssetTableColumns[5].Header,
      timeFrameInterval === EPredictoorContractInterval.e_5M
        ? '1 week'
        : '4 weeks'
    )
    newAssetTableColumns[6].Header = getThowLinesHeader(
      newAssetTableColumns[6].Header,
      '24h'
    )

    setTableColumns(newAssetTableColumns)
  }, [currentEpoch, timeFrameInterval])

  useEffect(() => {
    fetchAndCacheAllPairs()
    const interval = setInterval(() => {
      fetchAndCacheAllPairs()
    }, 1000)
    return () => clearInterval(interval)
  }, [fetchAndCacheAllPairs])

  const calculatedCSS = `
    @media screen and (max-width: 1000px) {
      .${styles.tableHeaderCell}, .${styles.tableRowCell} {
        width: ${window.innerWidth / 3}px !important;
      }
    }
  `

  return (
    tableColumns && (
      <>
        <style>{calculatedCSS}</style>
        <table className={styles.table}>
          <thead>
            <TableRowWrapper
              className={styles.tableRow}
              cellProps={{
                className: styles.tableHeaderCell
              }}
              cellType="th"
            >
              {tableColumns.map((item: any, index: number) => (
                <div
                  className={styles.assetHeaderContainer}
                  key={`assetHeader${item.accessor}`}
                  id={item.accessor}
                >
                  <span>{item.Header}</span>
                  <Tooltip
                    selector={`${item.accessor}Tooltip`}
                    text={(() => {
                      if (item.accessor !== 'accuracy')
                        return tooltipsText[
                          item.accessor as keyof typeof tooltipsText
                        ]

                      const tempKey =
                        timeFrameInterval === EPredictoorContractInterval.e_5M
                          ? 'accuracy_5m'
                          : 'accuracy_1h'
                      return tooltipsText[tempKey]
                    })()}
                  />
                </div>
              ))}
            </TableRowWrapper>
          </thead>
          {assetsData ? (
            assetsData.length > 0 ? (
              <tbody>
                {assetsData.map((item, index) => (
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
            )
          ) : (
            <tbody className={styles.message}>
              <tr>
                <td>Loading</td>
              </tr>
            </tbody>
          )}
        </table>
      </>
    )
  )
}
