import axios from 'axios'

export interface TokenData {
  symbol: string
  name: string
  image: string
  price: number
}

export const getTokenData = async (network: string) => {
  let tokenData: TokenData
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${network}`,
    {
      params: {},
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
  tokenData = {
    symbol: response.data.symbol,
    name: response.data.name,
    image: response.data.image.thumb,
    price: response.data.market_data.current_price.usd
  }

  return tokenData
}
