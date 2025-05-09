import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState
} from 'react'
import {
  HistoricalPair,
  Pair,
  TMarketPriceContext,
  TMarketPriceContextProps
} from './MarketPriceContext.types'
import { convertArrayToHistoricalPair } from './MarketPriceContextHelpers'
import { usePredictoorsContext } from './PredictoorsContext'
import { useTimeFrameContext } from './TimeFrameContext'

export const MarketPriceContext = createContext<TMarketPriceContext>({
  allPairsData: null,
  historicalPairsCache: new Map(),
  fetchAndCacheAllPairs: async () => undefined,
  fetchHistoricalPair: async () => undefined,
  isPriceLoading: true,
  setIsPriceLoading: () => {}
})

export const useMarketPriceContext = () => useContext(MarketPriceContext)

export const MarketPriceProvider: React.FC<TMarketPriceContextProps> = ({
  children
}) => {
  const [allPairsData, setAllPairsData] = useState<Pair[] | null>(null)
  const [historicalPairsCache, setHistoricalPairsCache] = useState<
    Map<string, Array<HistoricalPair>>
  >(new Map())
  const lastFetchTimestampRef = useRef<number | null>(null)
  const historicalTimestampsRef = useRef<number[]>([])
  const { timeFrameInterval } = useTimeFrameContext()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { isNewContractsInitialized } = usePredictoorsContext()

  const fetchPriceApi = async (path: string) => {
    let response
    try {
      //try to fetch from the Binance API
      response = await fetch(`https://api.binance.com/api/v3/${path}`)
      if (!response.ok) {
        // If response is not okay, throw an error to trigger fallback
        throw new Error('Binance API failed')
      }
    } catch (e: any) {
      //fall back to custom proxy API if Binance API fails
      console.error(
        'Binance API failed, falling back to custom API:',
        e.message
      )
      try {
        response = await fetch(
          `https://price-data.predictoor.ai/api/v3/${path}`
        )
        if (!response?.ok) {
          // If response is not okay from the fallback API, throw an error
          throw new Error('Fallback API failed')
        }
      } catch (fallbackError: any) {
        // Handle errors from the fallback API
        console.error('Fallback API failed:', fallbackError.message)
      }
    }
    return response
  }
  /**
   * Fetches all pairs from Binance API and stores them in the state.
   * @function
   * @async
   * @returns {Promise<void>}
   */
  const fetchAllPairs = useCallback(async () => {
    const response = await fetchPriceApi('ticker/price')
    if (response?.ok) {
      const data: Pair[] = await response?.json()
      lastFetchTimestampRef.current = Date.now()
      setAllPairsData(data)
    } else {
      console.error('Both APIs failed to fetch price data')
    }
  }, [])

  /**
   * Checks if the last fetch was more than 60 seconds ago.
   * @function
   * @returns {boolean}
   */
  const shouldFetchAgain = useCallback((): boolean => {
    if (!lastFetchTimestampRef.current) return true

    const differenceInSeconds =
      (Date.now() - lastFetchTimestampRef.current) / 1000
    return differenceInSeconds > 10
  }, [])

  /**
   * Deletes cached historical pairs that are older than 15 minutes.
   * @function
   */
  const clearOldCache = useCallback((): void => {
    const fifteenMinutesInMilliseconds = 15 * 60 * 1000
    const thresholdTime = Date.now() - fifteenMinutesInMilliseconds
    const tempHistoricalTimestamps = [...historicalTimestampsRef.current].sort()
    const tempHistoricalPairsCache = new Map(historicalPairsCache)
    const now = Date.now()

    while (
      tempHistoricalTimestamps.length &&
      tempHistoricalTimestamps[0] * 1000 < now - thresholdTime
    ) {
      const oldTimestamp = tempHistoricalTimestamps.shift()
      if (oldTimestamp) {
        // Check if oldTimestamp is not undefined
        const keysArray = Array.from(tempHistoricalPairsCache.keys())
        for (const key of keysArray) {
          if (key.endsWith(`_${oldTimestamp}`)) {
            tempHistoricalPairsCache.delete(key)
          }
        }
      }
    }

    if (tempHistoricalPairsCache.size === historicalPairsCache.size) return
    setHistoricalPairsCache(tempHistoricalPairsCache)
    historicalTimestampsRef.current = tempHistoricalTimestamps
  }, [historicalPairsCache])

  /**
   * Fetches historical pair from Binance API and stores it in the state.
   * @function
   * @async
   * @returns {Promise<HistoricalPair | undefined>}
   * @param {string} symbol - Symbol of the pair to fetch.
   * @param {number} timestamp - Timestamp of the pair to fetch.
   */
  const fetchHistoricalPair = useCallback(
    async (
      symbol: string,
      timestamp: number
    ): Promise<Array<HistoricalPair> | undefined> => {
      const cacheKey = `${symbol}_${timestamp}`
      const cachedValue = historicalPairsCache.get(cacheKey)

      if (cachedValue) {
        return cachedValue
      }

      const response = await fetchPriceApi(
        `klines?symbol=${symbol}&interval=${timeFrameInterval}&limit=5&startTime=${
          timestamp * 1000
        }`
      )

      let retrievedData: any
      if (response) {
        const data: Array<Array<string | number>> = await response.json()
        retrievedData = data.map((item) => convertArrayToHistoricalPair(item))

        setHistoricalPairsCache((prev) =>
          new Map(prev).set(cacheKey, retrievedData)
        )

        historicalTimestampsRef.current.push(timestamp)

        setTimeout(() => {
          clearOldCache()
          setIsLoading(false)
        }, 1000)
      }
      return retrievedData || []
    },
    [
      historicalPairsCache,
      clearOldCache,
      setHistoricalPairsCache,
      timeFrameInterval,
      isNewContractsInitialized
    ]
  )

  /**
   * Clears the historical pairs cache.
   * @function
   * @returns {void}
   */
  const clearCache = useCallback<() => void>(() => {
    setHistoricalPairsCache(new Map())
  }, [setHistoricalPairsCache])

  /**
   * Clears the historical pairs cache timestamps.
   * @function
   * @returns {void}
   */
  const clearCacheTimestamps = useCallback<() => void>(() => {
    historicalTimestampsRef.current = []
  }, [])

  /**
   * Fetch all pairs if the last fetch was more than 60 seconds ago.
   * @function
   * @returns {void}
   */
  const fetchAndCacheAllPairs = useCallback((): void => {
    if (shouldFetchAgain()) {
      fetchAllPairs()
    }
  }, [fetchAllPairs, shouldFetchAgain])

  const setIsPriceLoading = useCallback(
    (isLoading: boolean) => {
      clearCacheTimestamps()
      clearCache()
      setIsLoading(isLoading)
    },
    [setIsLoading, clearCacheTimestamps, clearCache]
  )

  return (
    <MarketPriceContext.Provider
      value={{
        allPairsData,
        historicalPairsCache,
        fetchAndCacheAllPairs,
        fetchHistoricalPair,
        isPriceLoading: isLoading,
        setIsPriceLoading
      }}
    >
      {children}
    </MarketPriceContext.Provider>
  )
}
