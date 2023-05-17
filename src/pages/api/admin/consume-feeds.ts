import { consumePredictoor } from '@/utils/predictoor';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import config from '../../../metadata/config.json';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Set appropriate CORS headers to allow external requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Check if the admin password is provided
    const adminPassword = req.body.password || req.headers['x-admin-password'];
  if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD ) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Limit the number of entries to process
    const maxEntries = 20;
    const tokenPredictions = config.production.tokenPredictions.slice(0, maxEntries);

    const predictoorRPC = process.env.NEXT_PUBLIC_PREDICTOOR_RPC || ''
    const predictoorPK = process.env.NEXT_PUBLIC_PREDICTOOR_PK || ''

    // Create an Ethereum provider
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_PREDICTOOR_RPC);
       
    // infura provider
    const infuraProviderETH = new ethers.providers.InfuraProvider(
      'homestead',
      predictoorRPC
    )
    
    const predictoorWallet = new ethers.Wallet(predictoorPK, infuraProviderETH)

    // Loop through each tokenPrediction object and call consumePredictoor
    for (const tokenPrediction of tokenPredictions) {
      await consumePredictoor(tokenPrediction, predictoorWallet, provider);
    }

    // Send a JSON response
    res.status(200).json({ message: 'Feeds updated successfully' });
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error('Error updating feeds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
