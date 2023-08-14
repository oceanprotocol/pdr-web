import { binance, kraken } from 'ccxt'
import {
  binancePriceEndpoint,
  krakenPriceEndpoint
} from './endpoints/thirdPartyEndpoints'

const binanceExchange = new binance()
const krakenExchange = new kraken()

export async function getBinancePrice(
  symbol: string,
  timestamp?: number
): Promise<string> {
  console.log(timestamp)
  return binanceExchange
    .fetchOHLCV(symbol, undefined, timestamp)
    .then((response) => {
      console.log(response)
      return response[0][1].toString()
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
  console.log(krakenPriceEndpoint(assetPair))
  //return '10'
  return krakenExchange
    .fetchOHLCV(assetPair)
    .then((response) => {
      console.log(response)
      return response.json()
    })
    .then((response) => {
      console.log(response)
      return response.result[assetPair].a[0]
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
