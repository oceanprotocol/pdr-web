import { networkProvider } from '@/utils/networkProvider'
import { ethers } from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'
import chainConfig from '../../../metadata/config.json'
import { updatePredictoorSubscriptions } from '../../../utils/predictoors'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Set appropriate CORS headers to allow external requests
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    )

    // Check if the admin password is provided
    const adminPassword =
      req.body.adminPassword || req.headers['x-admin-password']
    if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const env =
      process.env.NEXT_PUBLIC_ENV?.toString() as keyof typeof chainConfig
    const config = chainConfig[env]

    const predictoorPK = process.env.NEXT_PUBLIC_PREDICTOOR_PK || ''
    const provider = networkProvider.getProvider()

    const predictoorWallet = new ethers.Wallet(predictoorPK, provider)
    const results = await updatePredictoorSubscriptions(
      config,
      predictoorWallet,
      provider
    )

    // Send a JSON response
    res.status(200).json({
      message: 'Feeds consumed successfully',
      // predictoorRPC: predictoorRPC,
      // predictoorPK: predictoorPK,
      // provider: provider,
      // infuraProviderETH: infuraProviderETH,
      // predictoorWallet: predictoorWallet,
      results: results
    })
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error('Error consuming feeds:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
