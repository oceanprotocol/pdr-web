import { PredictionResult } from '@/utils/contracts/Predictoor'
import { calculatePrediction } from '@/utils/contracts/helpers/calculatePrediction'
import { graphqlClientInstance } from '../graphqlClient'

import { EPredictoorContractInterval } from '../types/EPredictoorContractInterval'
import {
  GET_PREDICT_SLOTS,
  SECONDS_IN_1_WEEK,
  SECONDS_IN_24_HOURS,
  TGetPredictSlotsQuery,
  TPredictSlots
} from './queries/getPredictSlots'

export const getSlots = async (
  subgraphURL: string,
  addresses: Array<string>,
  firstSlotTS: number,
  lastSlotTS: number,
  skip: number = 0,
  slots: Array<TPredictSlots> = []
): Promise<Array<TPredictSlots>> => {
  console.log('init slots', slots)
  const records_per_page = 1000
  const { data, errors } =
    await graphqlClientInstance.query<TGetPredictSlotsQuery>(
      GET_PREDICT_SLOTS,
      {
        assetIds: addresses,
        initialSlot: firstSlotTS,
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

  const tempSlots = [...slots, ...predictSlots]

  console.log('predictSlots.length', predictSlots.length)
  if (predictSlots.length === records_per_page) {
    // If we returned max results, resively get remaining data
    return await getSlots(
      subgraphURL,
      addresses,
      firstSlotTS,
      lastSlotTS,
      skip + records_per_page,
      tempSlots
    )
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
  const slots = await getSlots(subgraphURL, assets, firstSlot, lastSlotTS)

  console.log('resultslots', slots)
  // Group slots by predictContract
  const result = slots.reduce((acc, slot) => {
    const assetId = slot.predictContract.id
    if (!acc[assetId]) {
      acc[assetId] = []
    }
    acc[assetId].push(slot)
    return acc
  }, {} as Record<string, Array<TPredictSlots>>)

  return result

  //return Promise.all(
  //  assets.map(async (assetId) => {
  //    const slots = await getSlots(subgraphURL, assets, firstSlot, lastSlotTS)

  //    return { [assetId]: slots || [] }
  //  })
  //).then((slots) => {
  //  return Object.assign({}, ...slots)
  //})
}

export type TCalculateSlotStatsArgs = {
  subgraphURL: string
  assets: string[]
  lastSlotTS: number
  firstSlotTS: number
}
// Function to process slots and calculate average accuracy per predictContract
/*
export const calculateSlotStats = async ({
  subgraphURL,
  assets,
  lastSlotTS,
  firstSlotTS,
  timeFrameInterval
}: TCalculateSlotStatsArgs): Promise<
  [Record<string, number>, Record<string, number>, Record<string, number>]
> => {
  const slotsData = await fetchSlots(
    subgraphURL,
    assets,
    lastSlotTS,
    firstSlotTS
  )

  console.log('slotsData', slotsData)
  const contractAccuracy: Record<string, number> = {}
  const contractTotalStakeYesterday: Record<string, number> = {}
  const contractTotalStakeToday: Record<string, number> = {}
  let totalStakeToday: number = 0
  let totalStakedYesterday: number = 0

  for (const assetId in slotsData) {
    let totalSlots = 0
    let correctPredictions = 0

    if (!slotsData[assetId] || slotsData[assetId].length === 0) {
      contractAccuracy[assetId] = 0
      continue
    }

    for (const slot of slotsData[assetId]) {
      const timePeriodSeconds =
        timeFrameInterval === EPredictoorContractInterval.e_5M
          ? SECONDS_IN_24_HOURS
          : SECONDS_IN_1_WEEK
      if (slot.slot < lastSlotTS - timePeriodSeconds) {
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
*/

const calculateAverageAccuracy = (
  correctPredictions: number,
  totalSlots: number
): number => {
  return correctPredictions === 0 ? 0 : (correctPredictions / totalSlots) * 100
}

export const getSecondsOfTimeFrame = (
  timeFrameInterval: EPredictoorContractInterval
): number =>
  timeFrameInterval === EPredictoorContractInterval.e_5M
    ? SECONDS_IN_24_HOURS
    : SECONDS_IN_1_WEEK

export const calculateSlotStats = async ({
  subgraphURL,
  assets,
  lastSlotTS,
  firstSlotTS
}: TCalculateSlotStatsArgs): Promise<
  [Record<string, number>, Record<string, number>, Record<string, number>]
> => {
  const slotsData = await fetchSlots(
    subgraphURL,
    assets,
    lastSlotTS,
    firstSlotTS
  )
  if (!slotsData) {
    throw new Error('Failed to fetch slots data.')
  }

  console.log('slotsData', slotsData)

  const contractAccuracy: Record<string, number> = {}
  const contractTotalStakeYesterday: Record<string, number> = {}
  const contractTotalStakeToday: Record<string, number> = {}

  for (const assetId in slotsData) {
    const assetSlots = slotsData[assetId]
    if (!assetSlots || assetSlots.length === 0) {
      contractAccuracy[assetId] = 0
      continue
    }

    let totalSlots = 0
    let correctPredictions = 0
    let totalStakeToday = 0
    let totalStakedYesterday = 0

    //const timePeriodSeconds = getSecondsOfTimeFrame(timeFrameInterval)

    for (const slot of assetSlots) {
      if (
        slot.slot < lastSlotTS - SECONDS_IN_24_HOURS &&
        slot.slot > lastSlotTS - 2 * SECONDS_IN_24_HOURS
      ) {
        totalStakedYesterday += parseFloat(slot.roundSumStakes)
        continue
      }

      totalStakeToday += parseFloat(slot.roundSumStakes)
      if (parseFloat(slot.roundSumStakes) === 0) continue

      const prediction: PredictionResult = calculatePrediction(
        slot.roundSumStakesUp.toString(),
        slot.roundSumStakes.toString()
      )

      const trueValuesLength = slot.trueValues ? slot.trueValues.length : 0
      if (trueValuesLength > 0) {
        const trueValue = slot.trueValues[0].trueValue
        if (prediction.dir === (trueValue ? 1 : 0)) {
          correctPredictions++
        }
        totalSlots++
      }
    }

    contractAccuracy[assetId] = calculateAverageAccuracy(
      correctPredictions,
      totalSlots
    )
    contractTotalStakeYesterday[assetId] = totalStakedYesterday
    contractTotalStakeToday[assetId] = totalStakeToday
  }

  return [
    contractAccuracy,
    contractTotalStakeYesterday,
    contractTotalStakeToday
  ]
}
