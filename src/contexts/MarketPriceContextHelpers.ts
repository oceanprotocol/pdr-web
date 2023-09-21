import { ElementOf, ValueOfMap } from '@/utils/utils'
import { HistoricalPair, TMarketPriceContext } from './MarketPriceContext.types'

export type TGetSpecificPairFromContextDataArgs = {
  allPairsData: TMarketPriceContext['allPairsData']
  pairSymbol: string
}

/**
 * @description
 * Get the price of a specific pair from the context data
 */
export const getSpecificPairFromContextData = ({
  allPairsData,
  pairSymbol
}: TGetSpecificPairFromContextDataArgs): string =>
  allPairsData?.find((pair) => pair.symbol === pairSymbol)?.price || '0'

export type TGetFromTheHistoricalPairsCacheArgs = {
  historicalPairsCache: TMarketPriceContext['historicalPairsCache']
  pairSymbol: string
  timestamp: number
}

/**
 * @description
 * Get the cached value from the historicalPairsCache
 */
export const getFromTheHistoricalPairsCache = ({
  historicalPairsCache,
  pairSymbol,
  timestamp
}: TGetFromTheHistoricalPairsCacheArgs) => {
  const cacheKey = `${pairSymbol}_${timestamp}`
  const cachedValue = historicalPairsCache.get(cacheKey)

  if (cachedValue) {
    return cachedValue
  }
  return null
}

export type TGetClosestHistoricalPairsCacheArgs = {
  historicalPair: HistoricalPair[]
  timestamp: number
  print?: boolean
}

export const getClosestHistoricalPairsCache = ({
  historicalPair,
  timestamp,
  print = false
}: TGetClosestHistoricalPairsCacheArgs) => {
  if (print) {
    console.log('timestamp', timestamp)
  }
  const closestHistoricalPair = historicalPair.reduce((prev, curr) => {
    /*if (print) {
      console.log('prev', prev)
      console.log('curr', curr)
      console.log('timestamp', timestamp)
      console.log(
        'Math.abs(prev.openTime - timestamp)',
        prev.openTime - timestamp
      )
      console.log('----------...----------...----------')
    }*/
    return Math.abs(curr.openTime - timestamp) <
      Math.abs(prev.openTime - timestamp)
      ? curr
      : prev
  })
  return closestHistoricalPair
}

export const convertArrayToHistoricalPair = (
  data: Array<string | number>
): ElementOf<ValueOfMap<TMarketPriceContext['historicalPairsCache']>> => {
  const [
    openTime,
    open,
    high,
    low,
    close,
    volume,
    closeTime,
    quoteAssetVolume,
    numberOfTrades,
    takerBuyBaseAssetVolume,
    takerBuyQuoteAssetVolume,
    ignore
  ] = data
  return {
    openTime: openTime as number,
    open: open as string,
    high: high as string,
    low: low as string,
    close: close as string,
    volume: volume as string,
    closeTime: closeTime as number,
    quoteAssetVolume: quoteAssetVolume as string,
    numberOfTrades: numberOfTrades as number,
    takerBuyBaseAssetVolume: takerBuyBaseAssetVolume as string,
    takerBuyQuoteAssetVolume: takerBuyQuoteAssetVolume as string,
    ignore: ignore as string
  }
}
