import { PredictionResult } from '@/utils/contracts/Predictoor'
import { calculatePrediction } from '@/utils/contracts/helpers/calculatePrediction'
import { graphqlClientInstance } from '../graphqlClient'

import {
  GET_PREDICT_SLOTS,
  SECONDS_IN_24_HOURS,
  TGetPredictSlotsQuery,
  TPredictSlots
} from './queries/getPredictSlots'

export const getSlots = async (
  subgraphURL: string,
  address: string,
  slot24h: number,
  skip: number = 0,
  slots: Array<TPredictSlots> = []
): Promise<Array<TPredictSlots>> => {
  const records_per_page = 289
  const { data, errors } =
    await graphqlClientInstance.query<TGetPredictSlotsQuery>(
      GET_PREDICT_SLOTS,
      {
        assetIds: [address],
        initialSlot: slot24h,
        first: records_per_page,
        skip: skip
      },
      subgraphURL
    )

  const predictSlots = data?.predictSlots
  if (errors || !predictSlots || predictSlots.length === 0) {
    return slots
  }

  // Append new slots to existing ones
  slots.push(...predictSlots)

  if (predictSlots.length === records_per_page) {
    // If we returned max results, resively get remaining data
    return getSlots(
      subgraphURL,
      address,
      slot24h,
      skip + records_per_page,
      slots
    )
  } else {
    // All data retrieved
    return slots
  }
}

export const fetchSlots24Hours = async (
  subgraphURL: string,
  assets: string[],
  lastSlotTS: number = Date.now()
): Promise<Record<string, Array<TPredictSlots>>> => {
  const slot24h = lastSlotTS - SECONDS_IN_24_HOURS

  return Promise.all(
    assets.map(async (assetId) => {
      // Fetch slots for the given asset ID and 24-hour slot
      const slots = await getSlots(subgraphURL, assetId, slot24h)

      return { [assetId]: slots || [] }
    })
  ).then((slots) => {
    return Object.assign({}, ...slots)
  })
}

// Function to process slots and calculate average accuracy per predictContract
export const calculateAverageAccuracy = async (
  subgraphURL: string,
  assets: string[],
  lastSlotTS: number = Date.now()
): Promise<Record<string, number>> => {
  const slotsData = await fetchSlots24Hours(subgraphURL, assets, lastSlotTS)
  const contractAccuracy: Record<string, number> = {}

  for (const assetId in slotsData) {
    let totalSlots = 0
    let correctPredictions = 0

    if (!slotsData[assetId] || slotsData[assetId].length === 0) {
      contractAccuracy[assetId] = 0
      continue
    }

    for (const slot of slotsData[assetId]) {
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
    const averageAccuracy = (correctPredictions / totalSlots) * 100
    contractAccuracy[assetId] = averageAccuracy
  }

  return contractAccuracy
}
