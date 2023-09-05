export const SECONDS_IN_24_HOURS = 86400

export const GET_PREDICT_CONTRACTS_24H = `
  query getContract($assetId: String!) {
    predictContracts(
      orderBy: timestamp
      orderDirection: desc
      where: { id: $assetId }
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

export type TPredictContractSlots = {
  id: string
  slot: number
}

export type TPredictContracts = {
  id: string
  slots: Array<TPredictContractSlots>
  secondsPerEpoch: string
}

export type TGetPredictContracts24hQueryResult = {
  predictContracts: Array<TPredictContracts>
}

export const GET_PREDICT_SLOTS_24H = `
  query	getPredictSlots($asset: String!, $initialSlot: Int!, $first: Int!, $skip: Int!) {
    predictSlots (
      first: $first
      skip: $skip
      where: {
        slot_gte: $initialSlot
        predictContract: $asset 
      }
    ) {
      id
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


export type TPredictSlotsTrueValue = {
  id: string
  trueValue: Boolean
}

export type TPredictSlots = {
  id: string
  slot: number
  trueValues: TPredictSlotsTrueValue
  roundSumStakesUp: string
  roundSumStakes: string
}

export type TGetPredictSlots24hQueryResult = {
  predictSlots: Array<TPredictSlots>
}