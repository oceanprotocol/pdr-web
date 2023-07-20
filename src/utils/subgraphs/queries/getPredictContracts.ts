export const getPredictContracts = `query GetPredictContracts($offset: Int!, $chunkSize: Int!) {
    predictContracts(skip: $offset, first: $chunkSize) {
      id
      token {
        id
        name
        symbol
        nft {
          owner{
            id
          }
           nftData {
              key
              value
           }
        }
      }
      blocksPerEpoch
      blocksPerSubscription
      truevalSubmitTimeoutBlock
    }
  }`

type TNftOwner = {
  id: string
}

type TNft = {
  owner: TNftOwner
}

type TPredictToken = {
  id: string
  name: string
  symbol: string
  nft: TNft
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
