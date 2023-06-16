export const krakenPriceEndpoint = (symbol: string): string =>
  `https://api.kraken.com/0/public/Ticker?pair=${symbol}`

export const binancePriceEndpoint = (symbol: string): string =>
  `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
