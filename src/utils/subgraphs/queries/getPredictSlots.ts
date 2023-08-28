export const SECONDS_IN_24_HOURS = 86400

export const GET_PREDICT_CONTRACTS_24H = `
  query getContracts($assetIds: [String!]!) {
    predictContracts(
      first: 1
      orderBy: timestamp
      orderDirection: desc
      where: { id_in: $assetIds }
    ) {
      id
      slots {
        id
        slot
      }
      secondsPerEpoch
    }
  }
`

type TPredictContractSlots = {
  id: string
  slot: number
}

export type TPredictContracts = {
  id: string
  slots: TPredictContractSlots
  secondsPerEpoch: number
}

export type TGetPredictContracts24hQueryResult = {
  predictContracts: Array<TPredictContracts>
}

export const GET_PREDICT_SLOTS_24H = `
  query	getPredictSlots($asset: String!, $initialSlot: BigInt!, $first: Int!, $skip: Int!) {
    predictSlots (where: {predictContract: $asset}) {
      slot
      trueValues {
        id
        trueValue
      }
      roundSumStakesUp
      roundSumStakes
    }
  }
`

type TPredictSlotsTrueValue = {
  id: string
  trueValue: Boolean
}

export type TPredictSlots = {
  id: string
  slot: number
  trueValues: TPredictSlotsTrueValue
  roundSumStakesUp: number
  roundSumStakes: number
}

export type TGetPredictSlots24hQueryResult = {
  predictSlots: Array<TPredictSlots>
}