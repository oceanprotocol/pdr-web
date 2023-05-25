import axios from 'axios'
const crypto = require('crypto')
const qs = require('qs')

export const getMessageSignature = (
  path: string,
  request: any,
  secret: string,
  nonce: number
) => {
  const message = qs.stringify(request)
  const secret_buffer = new Buffer(secret, 'base64')
  const hash = new crypto.createHash('sha256')
  const hmac = new crypto.createHmac('sha512', secret_buffer)
  const hash_digest = hash.update(nonce + message).digest('binary')
  const hmac_digest = hmac.update(path + hash_digest, 'binary').digest('base64')

  return hmac_digest
}

export const getAssetPairPrice = async (assetPair: string) => {
  const response = await axios.get(
    `https://api.kraken.com/0/public/Ticker?pair=${assetPair}`,
    {
      headers: {}
    }
  )
  return response.data.result[assetPair].a[0]
}

export const getAssetBalance = async (
  apiKey: string | undefined,
  apiSecret: string | undefined
) => {
  if (!apiKey || !apiSecret) {
    console.error('Kraken API keys not configured')
    return undefined
  }
  var response
  try {
    response = await axios.get(`api/krakenBalance`, {
      params: { apiKey: apiKey, apiSecret: apiSecret }
    })
  } catch (e) {
    console.log(e)
  }
  console.log(response)
  return response?.data
}

export const setTrade = async (
  apiKey: string | undefined,
  apiSecret: string | undefined,
  assetPair: string,
  type: string,
  amount: number
) => {
  if (!apiKey || !apiSecret) {
    console.error('Kraken API keys not configured')
    return undefined
  }
  var response
  try {
    response = await axios.post(`api/krakenTrade`, {
      apiKey: apiKey,
      apiSecret: apiSecret,
      type: type,
      volume: amount,
      pair: assetPair
    })
  } catch (e) {
    console.log(e)
  }
  return response?.data
}
