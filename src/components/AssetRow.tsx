import { TokenData } from '@/utils/asset'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { Pair } from '@/contexts/MarketPriceContext.types'
import { getSpecificPairFromContextData } from '@/contexts/MarketPriceContextHelpers'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useSocketContext } from '@/contexts/SocketContext'
import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import Asset from './Asset'
import { TAssetData } from './AssetTable'
import { EEpochDisplayStatus, EpochDisplay } from './EpochDisplay'
import Price from './Price'
import Subscription, { SubscriptionStatus } from './Subscription'

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
  const { currentEpoch, secondsPerEpoch } = usePredictoorsContext()
  const [tokenData, setTokenData] = useState<TokenData>({
    name: '',
    symbol: '',
    pair: '',
    price: 0,
    market: ''
  })
  const { allPairsData } = useMarketPriceContext()

  const {
    tokenName,
    pairName,
    subscription,
    subscriptionPrice,
    subscriptionDuration,
    market,
    baseToken,
    quoteToken,
    interval,
    contract
  } = assetData

  const loadData = useCallback<(pairsData: Array<Pair>) => void>(
    (pairsData) => {
      const pairSymbol = `${baseToken}${quoteToken}`

      const price = getSpecificPairFromContextData({
        allPairsData: pairsData,
        pairSymbol: pairSymbol
      })

      const name = `${baseToken}-${quoteToken}`
      setTokenData({
        price: parseFloat(price),
        name,
        pair: pairSymbol,
        symbol: baseToken,
        market: market
      })
    },
    [baseToken, market, quoteToken]
  )

  const renewPrice = useCallback<() => Promise<void>>(async () => {
    if (!allPairsData) return
    loadData(allPairsData)
  }, [allPairsData, loadData])

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
      tokenName && pairName && subscription
        ? {
            tokenName,
            pairName,
            subscription,
            market
          }
        : null,
    [tokenName, pairName, subscription]
  )

  useEffect(() => {
    if (!allPairsData) return
    loadData(allPairsData)
  }, [allPairsData, loadData])

  if (!tokenData || !slotProps) return null

  return (
    <TableRowWrapper
      className={`${styles.tableRow} ${
        subscription == SubscriptionStatus.INACTIVE && styles.inactiveRow
      }`}
      cellProps={{
        className: styles.tableRowCell
      }}
    >
      <Asset assetData={tokenData} />
      <EpochDisplay
        status={EEpochDisplayStatus.PastEpoch}
        price={tokenData.price}
        {...slotProps}
        epochStartTs={currentEpoch - secondsPerEpoch}
        secondsPerEpoch={secondsPerEpoch}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.LiveEpoch}
        price={tokenData.price}
        {...slotProps}
        epochStartTs={currentEpoch}
        secondsPerEpoch={secondsPerEpoch}
      />
      <Price assetData={tokenData} />
      <EpochDisplay
        status={EEpochDisplayStatus.NextEpoch}
        price={tokenData.price}
        {...slotProps}
        epochStartTs={currentEpoch + secondsPerEpoch}
        secondsPerEpoch={secondsPerEpoch}
      />
      <span>56.2%</span>
      <Subscription
        subscriptionData={{
          price: parseInt(subscriptionPrice),
          status: subscription,
          duration: subscriptionDuration
        }}
        contractAddress={contract.address}
      />
    </TableRowWrapper>
  )
}
