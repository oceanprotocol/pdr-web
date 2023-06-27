import { ECoinGeckoIdList } from './appconstants'

export interface TokenData {
  symbol: string
  name: string
  image: string
  price: number
}
export const getTokenData = async (
  network: keyof typeof ECoinGeckoIdList
): Promise<TokenData> => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${ECoinGeckoIdList[network]}`
  )

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  const data = await response.json()

  return {
    symbol: data.symbol,
    name: data.name,
    image: data.image.thumb,
    price: data.market_data.current_price.usd
  }
}
