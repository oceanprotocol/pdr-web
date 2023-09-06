export const getHistoryDataQuery = `
    query GetHistoryData($slot_gte: Int!, $slot_lte: Int! $predictionContracts: [String!]!) {
        predictSlots(
            orderBy: slot,
            orderDirection: desc
            where: {
                predictContract_in: $predictionContracts,
                slot_gte: $slot_gte,
                slot_lte: $slot_lte
            }
        ) {
        id
        predictContract {
            id
        }
        slot
        roundSumStakesUp
        roundSumStakes
        }
    }
`

export type TPredictSlotsReturn = {
  id: string
  predictContract: {
    id: string
  }
  slot: number
  roundSumStakesUp: number
  roundSumStakes: number
}

export type TGetHistoryDataReturn = {
  predictSlots: TPredictSlotsReturn[]
}
