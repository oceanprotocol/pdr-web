import { ethers } from 'ethers'
import { overlapBlockCount } from '../appconstants'
import Predictoor from '../contracts/Predictoor'
import { TPredictionContract } from '../subgraphs/getAllInterestingPredictionContracts'
import { Maybe } from '../typeHelpers'
import { getSubscriptionDetails } from './getSubscriptionDetails'

export type TCheckAndBuySubscriptionResult = {
  status: 'bought' | 'exists'
  tx: Maybe<string>
  predictionContract: TPredictionContract
  expires: Maybe<number>
}

export const checkAndBuySubscription = async (
  predictoorProps: TPredictionContract,
  user: ethers.Wallet,
  provider: ethers.providers.JsonRpcProvider
): Promise<TCheckAndBuySubscriptionResult | null> => {
  try {
    const predictorContract = new Predictoor(predictoorProps.address, provider)
    await predictorContract.init()

    const [subscription, blockNumber, isValidSubscription] =
      await getSubscriptionDetails(predictorContract, user.address, provider)

    const expireBlock = parseInt(subscription.expires.toString())

    if (
      !isValidSubscription ||
      expireBlock <= blockNumber - overlapBlockCount
    ) {
      const receipt = await predictorContract.buyAndStartSubscription(user)

      let expires = null
      if (receipt) {
        await predictorContract.getSubscriptions(user.address)
        expires = parseInt(subscription.expires.toString())
      }

      return {
        status: 'bought',
        tx: receipt instanceof Error ? null : receipt?.transactionHash ?? null,
        predictionContract: predictoorProps,
        expires: expires || null
      }
    }

    return {
      status: 'exists',
      tx: null,
      predictionContract: predictoorProps,
      expires: expireBlock
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
  return null
}
