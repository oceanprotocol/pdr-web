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
