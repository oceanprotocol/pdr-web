import { graphqlClientInstance } from '../graphqlClient'
import { Maybe } from '../utils'
import {
  TGetPredictContractsQueryResult,
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
  subgraphURL: string,
  contractBlacklist: Maybe<Array<string>> = []
): Promise<Record<string, TPredictionContract>> => {
  const chunkSize = 1000
  let offset = 0
  const contracts: Record<string, TPredictionContract> = {}
  const whileValue = true
  while (whileValue) {
    const variables = {
      offset,
      chunkSize,
      contractBlacklist
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

    for (const item of predictContracts) {
      let market: string = ''
      let baseToken: string = ''
      let quoteToken: string = ''
      let interval: string = ''
      market = 'binance'
      const qbtks = item.token.name.split('/')
      baseToken = qbtks[0]
      quoteToken = qbtks[1]
      interval = item.secondsPerEpoch == '300' ? '5m' : '1h'

      contracts[item.id] = {
        name: item.token.name,
        address: item.id,
        owner: item.token.nft ? item.token.nft.owner.id : '',
        market: market,
        baseToken: baseToken,
        quoteToken: quoteToken,
        interval: interval,
        symbol: item.token.symbol,
        price:
          parseInt(item.token.lastPriceValue) > 0
            ? item.token.lastPriceValue
            : '3',
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
