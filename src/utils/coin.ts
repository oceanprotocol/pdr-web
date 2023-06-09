import axios from 'axios'
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
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${ECoinGeckoIdList[network]}`,
    {
      params: {},
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
  return {
    symbol: response.data.symbol,
    name: response.data.name,
    image: response.data.image.thumb,
    price: response.data.market_data.current_price.usd
  }
}
