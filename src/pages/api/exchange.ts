import axios from 'axios'
const crypto = require('crypto')
const qs = require('qs')

const getMessageSignature = (
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

export default async function handler(req: any, res: any) {
  /*const apiKey = 'x7NvADBhCHO+xoQuTrYAcoPHb7eRzRshO1EjRscpQSVokeTa4GqQuJIE'
  const apiSecret =
    '+NjFWaDXuT+Da9wsRbG2I0lbaZl+nwXKXOwuQC0QAEqUAFsk41Od7I1VIfZtqFhOzt7fB8XqSRZnAREeDYnB9A=='*/
  const baseUrl = 'https://api.kraken.com'
  const endpoint = '/0/private/Balance'

  const { apiKey, apiSecret } = req.query

  const nonce = Date.now() * 1000
  // Set the request data
  const postData = {
    nonce
  }

  // Generate the API-Sign header
  const signature = getMessageSignature(endpoint, postData, apiSecret, nonce)

  const formData = new URLSearchParams()
  formData.append('nonce', nonce.toString())
  // Set the request headers
  const headers = {
    'API-Key': apiKey,
    'API-Sign': signature,
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  try {
    // Make the POST request to Kraken API
    const response = await axios.post(`${baseUrl}${endpoint}`, formData, {
      headers
    })
    // Forward the Kraken API response to the client
    res.status(response.status).json(response.data)
  } catch (error: any) {
    // Handle any errors and send an appropriate response to the client
    res.status(error.response.status).json(error.response.data)
  }
}
