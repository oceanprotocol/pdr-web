export const getPredictContracts = `query GetPredictContracts($offset: Int!, $chunkSize: Int!) {
    predictContracts(skip: $offset, first: $chunkSize) {
      id
      token {
        id
        name
        symbol
      }
      blocksPerEpoch
      blocksPerSubscription
      truevalSubmitTimeoutBlock
    }
  }`

type TPredictToken = {
  id: string
  name: string
  symbol: string
}

type TPredictContract = {
  id: string
  token: TPredictToken
  blocksPerEpoch: string
  blocksPerSubscription: string
  truevalSubmitTimeoutBlock: number
}

export type TGetPredictContractsQueryResult = {
  predictContracts: Array<TPredictContract>
}
