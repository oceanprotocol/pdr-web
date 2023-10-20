import { PredictionResult } from '@/utils/contracts/Predictoor'
import { calculatePrediction } from '@/utils/contracts/helpers/calculatePrediction'
import { graphqlClientInstance } from '../graphqlClient'

import {
  GET_PREDICT_SLOTS,
  SECONDS_IN_24_HOURS,
  TGetPredictSlotsQuery,
  TPredictSlots
} from './queries/getPredictSlots'

export type TGetSlotsArgs = {
  subgraphURL: string
  address: string
  firstSlotTS: number
  lastSlotTS: number
  skip?: number
  slots?: Array<TPredictSlots>
}

export const getSlots = async ({
  subgraphURL,
  address,
  firstSlotTS,
  lastSlotTS,
  skip = 0,
  slots = []
}: TGetSlotsArgs): Promise<Array<TPredictSlots>> => {
  const recordsPerPage = 1000
  const { data, errors } =
    await graphqlClientInstance.query<TGetPredictSlotsQuery>(
      GET_PREDICT_SLOTS,
      {
        assetIds: [address],
        initialSlot: firstSlotTS,
        lastSlot: lastSlotTS,
        first: recordsPerPage,
        skip: skip
      },
      subgraphURL
    )

  const predictSlots = data?.predictSlots
  if (errors || !predictSlots || predictSlots.length === 0) {
    return slots
  }

  // Append new slots to existing ones
  const tempSlots = [...slots, ...predictSlots]

  if (predictSlots.length === recordsPerPage) {
    // If we returned max results, resively get remaining data
    return getSlots({
      subgraphURL,
      address,
      firstSlotTS: firstSlotTS,
      skip: skip + recordsPerPage,
      lastSlotTS,
      slots: tempSlots
    })
  } else {
    // All data retrieved
    return tempSlots
  }
}

export const fetchSlots = async (
  subgraphURL: string,
  assets: string[],
  lastSlotTS: number,
  firstSlot: number
): Promise<Record<string, Array<TPredictSlots>>> => {
  return Promise.all(
    assets.map(async (assetId) => {
      const slots = await getSlots({
        subgraphURL,
        address: assetId,
        firstSlotTS: firstSlot,
        lastSlotTS
      })

      return { [assetId]: slots || [] }
    })
  ).then((slots) => {
    return Object.assign({}, ...slots)
  })
}

// Function to process slots and calculate average accuracy per predictContract
export const calculateSlotStats = async (
  subgraphURL: string,
  assets: string[],
  lastSlotTS: number,
  firstSlotTS: number
): Promise<
  [Record<string, number>, Record<string, number>, Record<string, number>]
> => {
  const slotsData = await fetchSlots(
    subgraphURL,
    assets,
    lastSlotTS,
    firstSlotTS
  )
  const contractAccuracy: Record<string, number> = {}
  const contractTotalStakeYesterday: Record<string, number> = {}
  const contractTotalStakeToday: Record<string, number> = {}

  for (const assetId in slotsData) {
    let totalSlots = 0
    let correctPredictions = 0
    let totalStakeToday: number = 0
    let totalStakedYesterday: number = 0

    if (!slotsData[assetId] || slotsData[assetId].length === 0) {
      contractAccuracy[assetId] = 0
      continue
    }

    for (const slot of slotsData[assetId]) {
      if (slot.slot < lastSlotTS - SECONDS_IN_24_HOURS) {
        totalStakedYesterday += parseFloat(slot.roundSumStakes)
        continue
      }
      totalStakeToday += parseFloat(slot.roundSumStakes)
      if (parseFloat(slot.roundSumStakes) == 0) continue
      const prediction: PredictionResult = calculatePrediction(
        slot.roundSumStakesUp.toString(),
        slot.roundSumStakes.toString()
      )

      // Check if prediction was made, and if direction matches the trueValue
      const hasAnswer = slot.trueValues ? true : false
      const trueValuesLength = hasAnswer ? slot.trueValues.length : 0
      const trueValue =
        trueValuesLength > 0 ? slot.trueValues[0].trueValue : undefined

      // If the prediction was solved for, check if the dir matches trueValue
      if (hasAnswer === true && trueValuesLength > 0) {
        if (prediction.dir === (trueValue ? 1 : 0)) {
          correctPredictions++
        }
        totalSlots++
      }
    }

    // Calculate average accuracy
    // console.log(`Total slots for ${assetId}: ${totalSlots}`);
    // console.log(`Correct predictions for ${assetId}: ${correctPredictions}`);
    // console.log(`Average accuracy for ${assetId}: ${(correctPredictions / totalSlots) * 100}%`);
    const averageAccuracy =
      correctPredictions == 0 ? 0 : (correctPredictions / totalSlots) * 100
    contractAccuracy[assetId] = averageAccuracy
    contractTotalStakeYesterday[assetId] = totalStakedYesterday
    contractTotalStakeToday[assetId] = totalStakeToday
  }

  return [
    contractAccuracy,
    contractTotalStakeYesterday,
    contractTotalStakeToday
  ]
}
