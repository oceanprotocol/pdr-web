export type Pair = {
  symbol: string
  price: string
}

export type HistoricalPair = {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
  quoteAssetVolume: string
  numberOfTrades: number
  takerBuyBaseAssetVolume: string
  takerBuyQuoteAssetVolume: string
  ignore: string
}

export type TMarketPriceContext = {
  allPairsData: Pair[] | null
  historicalPairsCache: Map<string, Array<HistoricalPair>>
  fetchHistoricalPair: (
    pairSymbol: string,
    timestamp: number
  ) => Promise<Array<HistoricalPair> | undefined>
  fetchAndCacheAllPairs: () => void
}

export type TMarketPriceContextProps = {
  children: React.ReactNode
}
