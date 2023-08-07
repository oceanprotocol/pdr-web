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
  owner: string
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
      let market: string = ''
      let baseToken: string = ''
      let quoteToken: string = ''
      item.token.nft.nftData.forEach((i: TNft) => {
        if (i.key == NftKeys.MARKET) {
          market = Buffer.from(i.value.slice(2), 'hex').toString('utf8')
        } else if (i.key == NftKeys.BASE) {
          baseToken = Buffer.from(i.value.slice(2), 'hex').toString('utf8')
        } else if (i.key == NftKeys.QUOTE) {
          quoteToken = Buffer.from(i.value.slice(2), 'hex').toString('utf8')
        }
      })

      contracts[item.id] = {
        name: item.token.name,
        address: item.id,
        owner: item.token.nft.owner.id,
        market: market,
        baseToken: baseToken,
        quoteToken: quoteToken,
        symbol: item.token.symbol,
        price: item.token.lastPriceValue,
        blocksPerEpoch: item.blocksPerEpoch,
        blocksPerSubscription: item.blocksPerSubscription,
        last_submitted_epoch: 0
      }
    }

    offset += chunkSize
  }

  return contracts
}
