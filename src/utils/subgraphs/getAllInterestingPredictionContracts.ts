import { graphqlClientInstance } from '../graphqlClient'
import {
  TGetPredictContractsQueryResult,
  getPredictContracts
} from './queries/getPredictContracts'

export type TPredictionContract = {
  name: string
  address: string
  symbol: string
  price: string
  blocksPerEpoch: string
  blocksPerSubscription: string
  last_submitted_epoch: number
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

    for (const item of predictContracts) {
      contracts[item.id] = {
        price: item.token.lastPriceValue,
        name: item.token.name,
        address: item.id,
        symbol: item.token.symbol,
        blocksPerEpoch: item.blocksPerEpoch,
        blocksPerSubscription: item.blocksPerSubscription,
        last_submitted_epoch: 0
      }
    }

    offset += chunkSize
  }

  return contracts
}
