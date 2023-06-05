import { getMessageSignature } from '@/utils/kraken'
import axios from 'axios'

export default async function handler(req: any, res: any) {
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
