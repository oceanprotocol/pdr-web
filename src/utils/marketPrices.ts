import {
  binancePriceEndpoint,
  krakenPriceEndpoint
} from './endpoints/thirdPartyEndpoints'

export async function getBinancePrice(
  symbol: string,
  timestamp: number
): Promise<string> {
  console.log(timestamp)
  return fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&startTime=${
      timestamp * 1000
    }`
  )
    .then((response) => response.json())
    .then((response) => {
      console.log(timestamp, response[0][1])
      return response[0][1]
    })
    .catch((error) => {
      console.error(error)
      return '0'
    })
}

export const getKrakenPrice = async (
  assetPair: string,
  timestamp: number
): Promise<string> => {
  return fetch(
    `https://api.kraken.com/0/public/OHLC?pair=${assetPair}&since=${timestamp}`
  )
    .then((response) => response.json())
    .then((response) => {
      return response.result[assetPair][0][1]
    })
    .catch((error) => {
      console.error(error)
      return '0'
    })
}

export async function getBinanceCurrentPrice(symbol: string): Promise<string> {
  return fetch(binancePriceEndpoint(symbol))
    .then((response) => response.json())
    .then((response) => {
      return response.price
    })
    .catch((error) => {
      console.error(error)
      return '0'
    })
}

export const getKrakenCurrentPrice = async (
  assetPair: string
): Promise<string> => {
  return fetch(krakenPriceEndpoint(assetPair))
    .then((response) => response.json())
    .then((response) => {
      return response.result[assetPair].a[0]
    })
    .catch((error) => {
      console.error(error)
      return '0'
    })
}

export type TGetAssetPairPriceArgs = {
  assetPair: string
  timestamp?: number
  market?: string
}

export const getAssetPairPrice = async ({
  assetPair,
  timestamp,
  market
}: TGetAssetPairPriceArgs): Promise<string> => {
  switch (market) {
    case 'binance':
      return timestamp
        ? getBinancePrice(assetPair, timestamp)
        : getBinanceCurrentPrice(assetPair)
    case 'kraken':
      return timestamp
        ? getKrakenPrice(assetPair, timestamp)
        : getKrakenCurrentPrice(assetPair)
    default:
      return timestamp
        ? getBinancePrice(assetPair, timestamp)
        : getBinanceCurrentPrice(assetPair)
  }
}

//export const getAssetPairPrice2 = async (
