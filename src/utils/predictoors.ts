import Predictor from '@/utils/contracts/Predictoor'
import { ethers } from 'ethers'
import { filterOutUnwantedTypes } from './clearUnwantedTypes'
import { TGetSubscriptions } from './contracts/ContractReturnTypes'
import {
  TPredictionContract,
  getAllInterestingPredictionContracts
} from './subgraphs/getAllInterestingPredictionContracts'
import { getFilteredOrders } from './subgraphs/getFilteredOrders'
import { TGetFilteredOrdersQueryResult } from './subgraphs/queries/getFilteredOrdersQuery'
import { Maybe } from './typeHelpers'

const overlapBlockCount = 100

export type TSubscriptionStartedResult = {
  status: 'bought' | 'exists'
  tx: Maybe<string>
  predictionContract: TPredictionContract
  expires: Maybe<number>
}

export type TConsumedSubscription = Omit<TSubscriptionStartedResult, 'tx'> & {
  tx: null
  orders: Maybe<TGetFilteredOrdersQueryResult['orders']>
}

const consumePredictoorSubscription = async (
  chainConfig: any,
  predictoorProps: TPredictionContract,
  user: ethers.Wallet,
  provider: ethers.providers.JsonRpcProvider
): Promise<TConsumedSubscription | TSubscriptionStartedResult | null> => {
  try {
    // console.log("init PredictoorContract: ", predictoorProps, provider );
    const predictorContract = new Predictor(predictoorProps.address, provider)

    await predictorContract.init()

    //console.log('predictorContract', predictorContract)

    const [subscription, blockNumber, isValidSubscription] =
      await getSubscriptionDetails(predictorContract, user.address, provider)

    const expireBlock = parseInt(subscription.expires.toString())

    //console.log('!isValidSubscription', !isValidSubscription)
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
        tx: receipt instanceof Error ? null : receipt?.transactionHash ?? null,
        predictionContract: predictoorProps,
        expires: expires || null
      }
    }

    const orders = (
      await getFilteredOrders(predictoorProps.address, user.address)
    )?.data?.orders

    return {
      tx: null,
      orders: orders || null,
      predictionContract: predictoorProps,
      expires: expireBlock
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
  return null
}

const checkAndBuySubscription = async (
  predictoorProps: TPredictionContract,
  user: ethers.Wallet,
  provider: ethers.providers.JsonRpcProvider
): Promise<TSubscriptionStartedResult | null> => {
  try {
    const predictorContract = new Predictor(predictoorProps.address, provider)
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

const consumeCurrentPredictoorSubscription = async (
  predictoorProps: TPredictionContract,
  user: ethers.Wallet,
  provider: ethers.providers.JsonRpcProvider
): Promise<TConsumedSubscription | null> => {
  try {
    const predictorContract = new Predictor(predictoorProps.address, provider)
    await predictorContract.init()

    const [subscription, blockNumber, isValidSubscription] =
      await getSubscriptionDetails(predictorContract, user.address, provider)

    const expireBlock = parseInt(subscription.expires.toString())


const getSubscriptionDetails = (
  predictorContract: Predictor,
  userAddress: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<[TGetSubscriptions, number, boolean]> => {
  return Promise.all([
    predictorContract.getSubscriptions(userAddress),
    provider.getBlockNumber(),
    predictorContract.isValidSubscription(userAddress)
  ])
}

async function updatePredictoorSubscriptions(
  config: any,
  user: ethers.Wallet,
  provider: ethers.providers.JsonRpcProvider
): Promise<Maybe<Array<TSubscriptionStartedResult | TConsumedSubscription>>> {
  try {
    // retrieve all contract details from subgraph
    const predictoorContract = await getAllInterestingPredictionContracts(
      config.subgraph
    )

    // iterate through all deployed predictoors and buy a subscription
    return filterOutUnwantedTypes(
      await Promise.all(
        Object.values(predictoorContract).map((predictoorProps) =>
          consumePredictoorSubscription(config, predictoorProps, user, provider)
        )
      )
    )
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  return null
}

export { consumePredictoorSubscription, updatePredictoorSubscriptions, checkAndBuySubscription }
