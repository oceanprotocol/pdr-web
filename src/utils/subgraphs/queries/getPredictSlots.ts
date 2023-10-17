export const SECONDS_IN_24_HOURS = 86400
export const SECONDS_IN_1_WEEK = 604800

export const GET_PREDICT_CONTRACTS = `
  query getContracts($assetIds: [String!]!) {
    predictContracts(
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
  slots: Array<TPredictContractSlots>
  secondsPerEpoch: string
}

export type TGetPredictContractsQuery = {
  predictContracts: Array<TPredictContracts>
}

export const GET_PREDICT_SLOTS = `
  query	getPredictSlots($assetIds: [String!]!, $initialSlot: Int!, $first: Int!, $skip: Int!) {
    predictSlots (
      first: $first
      skip: $skip
      where: {
        slot_gte: $initialSlot
        predictContract_in: $assetIds
        roundSumStakes_gt: "0"
      }
    ) {
      id
      slot
      predictContract {
        id
      }
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
  predictContract: {
    id: string
  }
  trueValues: Array<TPredictSlotsTrueValue>
  roundSumStakesUp: string
  roundSumStakes: string
}

export type TGetPredictSlotsQuery = {
  predictSlots: Array<TPredictSlots>
}
