import { ethers } from 'ethers'
import { TGetSubscriptions } from '../contracts/ContractReturnTypes'
import Predictoor from '../contracts/Predictoor'

export const getSubscriptionDetails = (
  predictorContract: Predictoor,
  userAddress: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<[TGetSubscriptions, number, boolean]> =>
  Promise.all([
    predictorContract.getSubscriptions(userAddress),
    provider.getBlockNumber(),
    predictorContract.isValidSubscription(userAddress)
  ])
