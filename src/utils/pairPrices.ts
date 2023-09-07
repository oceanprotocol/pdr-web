type Pair = {
  symbol: string
  price: string
}

type HistoricalPair = {
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

/**
 * Stores fetched pairs from Binance for real-time data.
 * @type {Pair[] | null}
 */
let allPairsData: Pair[] | null = null

/**
 * A mapping to store historical data based on the symbol and timestamp.
 * The map's key is a combination of symbol and timestamp for easy retrieval.
 * @type {Map<string, HistoricalPair>}
 */
let historicalPairsCache: Map<string, HistoricalPair> = new Map()

/**
 * A sorted array to store timestamps of cached data for quick removal of old entries.
 * @type {number[]}
 */
let historicalTimestamps: number[] = []

/**
 * Stores the timestamp of the last fetch for real-time data.
 * @type {number | null}
 */
let lastFetchTimestamp: number | null = null

/**
 * Fetch all trading pairs from Binance for real-time data.
 * @async
 * @function
 * @returns {Promise<void>}
 */
const fetchAllPairs = async (): Promise<void> => {
  const response = await fetch('https://api.binance.com/api/v3/ticker/price')
  const data: Pair[] = await response.json()

  allPairsData = data
  lastFetchTimestamp = Date.now()
}

/**
 * Adds a timestamp to the sorted array (keeps the array sorted).
 * @function
 * @param {number} timestamp
 */
const addTimestamp = (timestamp: number): void => {
  let i = historicalTimestamps.length - 1
  while (i >= 0 && historicalTimestamps[i] > timestamp) {
    i--
  }
  historicalTimestamps.splice(i + 1, 0, timestamp)
}

/**
 * Removes an entry from the historicalPairsCache based on a timestamp.
 * @function
 * @param {number} oldTimestamp - The timestamp to base removal on.
 */
const removeCacheEntryByTimestamp = (oldTimestamp: number): void => {
  const keysArray = Array.from(historicalPairsCache.keys())
  for (const key of keysArray) {
    if (key.endsWith(`_${oldTimestamp}`)) {
      historicalPairsCache.delete(key)
    }
  }
}

/**
 * Deletes cached historical pairs that are older than 15 minutes.
 * @function
 */
const clearOldCache = (): void => {
  const fifteenMinutesInMilliseconds = 15 * 60 * 1000
  const thresholdTime = Date.now() - fifteenMinutesInMilliseconds

  while (
    historicalTimestamps.length &&
    historicalTimestamps[0] * 1000 < thresholdTime
  ) {
    const oldTimestamp = historicalTimestamps.shift()
    if (oldTimestamp) {
      // Check if oldTimestamp is not undefined
      removeCacheEntryByTimestamp(oldTimestamp)
    }
  }
}
/**
 * Fetch historical data for a specific trading pair from Binance.
 * @async
 * @function
 * @param {string} symbol - The trading pair symbol.
 * @param {number} timestamp - The timestamp for historical data.
 * @returns {Promise<HistoricalPair | undefined>}
 */
const fetchHistoricalPair = async (
  symbol: string,
  timestamp: number
): Promise<HistoricalPair | undefined> => {
  const cacheKey = `${symbol}_${timestamp}`
  const cachedValue = historicalPairsCache.get(cacheKey)

  if (cachedValue) {
    return cachedValue
  }

  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&startTime=${
      timestamp * 1000
    }`
  )
  const data: HistoricalPair[] = await response.json()

  clearOldCache()
  const retrievedData = data[0]
  historicalPairsCache.set(cacheKey, retrievedData)
  addTimestamp(timestamp) // Add the timestamp to the sorted array when caching data

  return retrievedData
}

/**
 * Determine if a new fetch is needed based on a 1-minute interval.
 * @function
 * @returns {boolean} - True if it's been more than a minute since the last fetch, false otherwise.
 */
const shouldFetchAgain = (): boolean => {
  if (!lastFetchTimestamp) return true

  const differenceInSeconds = (Date.now() - lastFetchTimestamp) / 1000
  return differenceInSeconds > 60
}

/**
 * Get a specific trading pair's data. If a timestamp is provided, retrieves historical data from cache or fetches it. Otherwise, if the data is older than 1 minute, it fetches the latest data.
 * @async
 * @function
 * @param {string} pairSymbol - The trading pair symbol.
 * @param {number} [timestamp] - An optional specific timestamp for historical data.
 * @returns {Promise<Pair | HistoricalPair | undefined>}
 */
export const getSpecificPair = async (
  pairSymbol: string,
  timestamp?: number
): Promise<string> => {
  if (timestamp) {
    return (await fetchHistoricalPair(pairSymbol, timestamp))?.open || '0'
  } else if (shouldFetchAgain()) {
    await fetchAllPairs()
  }

  return allPairsData?.find((pair) => pair.symbol === pairSymbol)?.price || '0'
}
