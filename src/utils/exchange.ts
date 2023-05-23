import axios from 'axios'

export const getAssetPairPrice = async (assetPair: string) => {
  const response = await axios.get(
    `https://api.kraken.com/0/public/Ticker?pair=${assetPair}`,
    {
      headers: {}
    }
  )
  return response.data.result[assetPair].a[0]
}

export const getAssetBalance = async (apiKey: string, apiSecret: string) => {
  var response
  try {
    response = await axios.get(`api/exchange`, {
      params: { apiKey: apiKey, apiSecret: apiSecret }
    })
  } catch (e) {
    console.log(e)
  }
  console.log(response)
  return response?.data
}
