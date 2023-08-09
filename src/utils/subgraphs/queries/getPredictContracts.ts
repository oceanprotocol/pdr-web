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
      secondsPerEpoch
      secondsPerSubscription
    }
  }`

export enum NftKeys {
  MARKET = '0xf7e3126f87228afb82c9b18537eed25aaeb8171a78814781c26ed2cfeff27e69',
  INTERVAL = '0x49435d2ff85f9f3594e40e887943d562765d026d50b7383e76891f8190bff4c9'
}

export type TNft = {
  key: string
  value: string
}

type TNftOwner = {
  id: string
}

export type TNftData = {
  owner: TNftOwner
  nftData: TNft[]
}

type TPredictToken = {
  id: string
  name: string
  symbol: string
  lastPriceValue: string
  nft: TNftData
}

export type TPredictContract = {
  id: string
  token: TPredictToken
  secondsPerEpoch: string
  secondsPerSubscription: string
}

export type TGetPredictContractsQueryResult = {
  predictContracts: Array<TPredictContract>
}
