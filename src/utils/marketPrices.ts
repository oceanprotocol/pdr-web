import {
  binancePriceEndpoint,
  krakenPriceEndpoint
} from './endpoints/thirdPartyEndpoints'

export async function getBinancePrice(symbol: string): Promise<string> {
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

export const getKrakenPrice = async (assetPair: string): Promise<string> => {
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
  market?: string
}

export const getAssetPairPrice = async ({
  assetPair,
  market
}: TGetAssetPairPriceArgs): Promise<string> => {
  switch (market) {
    case 'binance':
      return getBinancePrice(assetPair)
    case 'kraken':
      return getKrakenPrice(assetPair)
    default:
      return getBinancePrice(assetPair)
  }
}

//export const getAssetPairPrice2 = async (
