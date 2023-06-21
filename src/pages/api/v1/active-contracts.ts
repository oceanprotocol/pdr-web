import { currentConfig, predictoorWallet } from '@/utils/appconstants'
import { networkProvider } from '@/utils/networkProvider'
import {
  TConsumedSubscription,
  TSubscriptionStartedResult,
  updatePredictoorSubscriptions
} from '@/utils/predictoors'
import { Maybe } from '@/utils/typeHelpers'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    Maybe<Array<TSubscriptionStartedResult | TConsumedSubscription>>
  >
) {
  try {
    const result = await updatePredictoorSubscriptions(
      currentConfig,
      predictoorWallet,
      networkProvider.getProvider()
    )

    res.status(200).json(result)
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}
