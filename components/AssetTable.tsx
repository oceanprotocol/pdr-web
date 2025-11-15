'use client'

import React, { useCallback, useEffect, useMemo } from 'react'
import { tooltipsText } from '../metadata/tootltips'

import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useTimeFrameContext } from '@/contexts/TimeFrameContext'
import LiveTime from './elements/LiveTime'
import { TableRowWrapper } from './elements/TableRowWrapper'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
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
import { SearchFilters } from './SearchBar'

type TableColumn = {
  Header: string | React.ReactNode
  accessor: string
}

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
  contracts: Record<string, TPredictionContract> | undefined
  filters: SearchFilters
}

export type TAssetTableState = {
  AssetsData: Array<TAssetData>
}

export const AssetTable: React.FC<TAssetTableProps> = ({ contracts, filters }) => {
  const { subscribedPredictoors, currentEpoch, secondsPerEpoch } =
    usePredictoorsContext()

  const { fetchAndCacheAllPairs } = useMarketPriceContext()

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

  const getThowLinesHeader = (
    firstLineText: string,
    secondLineText: string
  ) => {
    return (
      <div className="flex flex-col">
        {firstLineText}
        <span className="text-xs text-muted-foreground">{secondLineText}</span>
      </div>
    )
  }

  const assetsData = useMemo<TAssetTableState['AssetsData'] | undefined>(() => {
    if (!contracts) return undefined

    const assets: TAssetTableState['AssetsData'] = []

    Object.entries(contracts).forEach(([, contract]) => {
      const [tokenName, pairName] = splitContractName(contract.name)

      const subscriptionStatus = getSubscriptionStatus(contract)

      assets.push({
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

    assets.sort((a, b) => {
      if (a.subscription === SubscriptionStatus.FREE) return -1
      if (b.subscription === SubscriptionStatus.FREE) return 1
      if (a.subscription === SubscriptionStatus.ACTIVE) return -1
      if (b.subscription === SubscriptionStatus.ACTIVE) return 1
      for (const token of privilegedTokens) {
        if (a.tokenName === token) return -1
        if (b.tokenName === token) return 1
      }
      return a.tokenName.toUpperCase().charCodeAt(0) - b.tokenName.toUpperCase().charCodeAt(0)
    })

    // Apply search filters
    let filteredAssets = assets

    if (filters.ticker) {
      const searchTerm = filters.ticker.toLowerCase()
      filteredAssets = filteredAssets.filter(
        (asset) =>
          asset.baseToken.toLowerCase().includes(searchTerm) ||
          asset.quoteToken.toLowerCase().includes(searchTerm) ||
          asset.tokenName.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.platform && filters.platform !== 'all') {
      filteredAssets = filteredAssets.filter(
        (asset) => asset.market.toLowerCase() === filters.platform.toLowerCase()
      )
    }

    return filteredAssets
  }, [contracts, getSubscriptionStatus, filters])

  /**
   * Colonnes dérivées de assetTableColumns + currentEpoch + timeFrameInterval
   * -> useMemo au lieu de useEffect + setState
   */
  const tableColumns = useMemo<TableColumn[]>(() => {
    // clone profond simple
    const newAssetTableColumns: TableColumn[] = JSON.parse(
      JSON.stringify(assetTableColumns)
    )

    if (!currentEpoch) return newAssetTableColumns

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
      newAssetTableColumns[5].Header as string,
      timeFrameInterval === EPredictoorContractInterval.e_5M
        ? '1 week'
        : '4 weeks'
    )
    newAssetTableColumns[6].Header = getThowLinesHeader(
      newAssetTableColumns[6].Header as string,
      '24h'
    )

    return newAssetTableColumns
  }, [currentEpoch, secondsPerEpoch, timeFrameInterval])

  /**
   * Cet effet est OK : il synchronise un système externe (fetch) avec React
   */
  useEffect(() => {
    fetchAndCacheAllPairs()
    const interval = setInterval(() => {
      fetchAndCacheAllPairs()
    }, 1000)
    return () => clearInterval(interval)
  }, [fetchAndCacheAllPairs])

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <TableRowWrapper
            className="border-b border-border"
            cellProps={{
              className:
                'px-4 py-3 text-left text-sm font-medium min-w-[150px]'
            }}
            cellType="th"
          >
            {tableColumns.map((item) => {
              const getTooltipText = () => {
                if (item.accessor !== 'accuracy')
                  return tooltipsText[
                    item.accessor as keyof typeof tooltipsText
                  ]

                const tempKey =
                  timeFrameInterval === EPredictoorContractInterval.e_5M
                    ? 'accuracy_5m'
                    : 'accuracy_1h'
                return tooltipsText[tempKey]
              }

              return (
                <div
                  className="flex items-center gap-1"
                  key={`assetHeader${item.accessor}`}
                  id={item.accessor}
                >
                  <span>{item.Header}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex items-center justify-center ml-1">
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{getTooltipText()}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )
            })}
          </TableRowWrapper>
        </thead>
        {assetsData ? (
          assetsData.length > 0 ? (
            <tbody>
              {assetsData.map((item) => (
                <AssetRow
                  key={`assetRow${item.contract.address}`}
                  assetData={item}
                />
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td
                  className="px-4 py-8 text-center text-muted-foreground"
                  colSpan={7}
                >
                  No contracts found
                </td>
              </tr>
            </tbody>
          )
        ) : (
          <tbody>
            <tr>
              <td
                className="px-4 py-8 text-center text-muted-foreground"
                colSpan={7}
              >
                Loading
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  )
}
