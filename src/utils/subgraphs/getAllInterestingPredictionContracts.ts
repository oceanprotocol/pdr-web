import { currentConfig } from '@/utils/appconstants'
import { graphqlClientInstance } from '../graphqlClient'
import {
  NftKeys,
  TGetPredictContractsQueryResult,
  TNft,
  getPredictContracts
} from './queries/getPredictContracts'

export type TPredictionContract = {
  name: string
  address: string
  symbol: string
  price: string
  market: string
  baseToken: string
  quoteToken: string
  interval: string
  owner: string
  secondsPerEpoch: string
  secondsPerSubscription: string
  last_submitted_epoch: number
  publishMarketFeeAddress: string
  publishMarketFeeAmount: string
  publishMarketFeeToken: string
  paymentCollector: string
}

export const getAllInterestingPredictionContracts = async (
  subgraphURL: string
): Promise<Record<string, TPredictionContract>> => {
  const chunkSize = 1000
  let offset = 0
  const contracts: Record<string, TPredictionContract> = {}
  const whileValue = true
  while (whileValue) {
    const variables = {
      offset,
      chunkSize
    }

    const { data, errors } =
      await graphqlClientInstance.query<TGetPredictContractsQueryResult>(
        getPredictContracts,
        variables,
        subgraphURL
      )

    const predictContracts = data?.predictContracts

    if (errors || !predictContracts || predictContracts.length === 0) {
      break
    }

    //If given a specific order in config, sort the contracts to follow that
    currentConfig.predictionsOrder &&
      predictContracts.sort((a, b) => {
        const indexA = currentConfig.predictionsOrder
          ? currentConfig.predictionsOrder?.indexOf(a.id)
          : -1
        const indexB = currentConfig.predictionsOrder
          ? currentConfig.predictionsOrder?.indexOf(b.id)
          : -1

        // If both ids are in the predefined list, compare their positions
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB
        }

        // If one id is in the predefined list, it comes first
        if (indexA !== -1) {
          return -1
        }

        if (indexB !== -1) {
          return 1
        }

        // If neither id is in the predefined list, maintain original order
        return 0
      })

    for (const item of predictContracts) {
      let market: string = ''
      let baseToken: string = ''
      let quoteToken: string = ''
      let interval: string = ''
      item.token.nft.nftData.forEach((i: TNft) => {
        if (i.key == NftKeys.MARKET) {
          market = Buffer.from(i.value.slice(2), 'hex').toString('utf8')
        } else if (i.key == NftKeys.BASE) {
          baseToken = Buffer.from(i.value.slice(2), 'hex').toString('utf8')
        } else if (i.key == NftKeys.QUOTE) {
          quoteToken = Buffer.from(i.value.slice(2), 'hex').toString('utf8')
        } else if (i.key == NftKeys.INTERVAL) {
          interval = Buffer.from(i.value.slice(2), 'hex').toString('utf8')
        }
      })

      contracts[item.id] = {
        name: item.token.name,
        address: item.id,
        owner: item.token.nft.owner.id,
        market: market,
        baseToken: baseToken,
        quoteToken: quoteToken,
        interval: interval,
        symbol: item.token.symbol,
        price: item.token.lastPriceValue,
        secondsPerEpoch: item.secondsPerEpoch,
        secondsPerSubscription: item.secondsPerSubscription,
        last_submitted_epoch: 0,
        publishMarketFeeAddress: item.token.publishMarketFeeAddress,
        publishMarketFeeAmount: item.token.publishMarketFeeAmount,
        paymentCollector: item.token.paymentCollector,
        publishMarketFeeToken: item.token.publishMarketFeeToken
      }
    }

    offset += chunkSize
  }

  return contracts
}
