import { ElementOf, ValueOfMap } from '@/utils/utils'
import { TMarketPriceContext } from './MarketPriceContext.types'

export const getSpecificPairFromContextData = (args: {
  allPairsData: TMarketPriceContext['allPairsData']
  pairSymbol: string
}): string => {
  const { allPairsData, pairSymbol } = args
  return allPairsData?.find((pair) => pair.symbol === pairSymbol)?.price || '0'
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
