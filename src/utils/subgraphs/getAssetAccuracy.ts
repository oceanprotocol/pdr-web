import { calculatePrediction } from '@/utils/contracts/Predictoor';
import { graphqlClientInstance } from '../graphqlClient';
import {
  GET_PREDICT_CONTRACTS_24H,
  GET_PREDICT_SLOTS_24H,
  SECONDS_IN_24_HOURS,
  TGetPredictContracts24hQueryResult,
  TGetPredictSlots24hQueryResult,
  TPredictSlots
} from './queries/getPredictSlots';

export const getSlots = async(
  subgraphURL: string,
  address: string, 
  slot24h: number, 
  skip: number = 0, 
  slots: Array<TPredictSlots> = []
): Promise<Array<TPredictSlots>> => {
  const records_per_page = 1000;
  const { data, errors } = await graphqlClientInstance.query<TGetPredictSlots24hQueryResult>(
    GET_PREDICT_SLOTS_24H,
    {
      asset: address,
      initialSlot: slot24h,
      first: records_per_page,
      skip: skip,
    },
    subgraphURL
  )
  
  const predictSlots = data?.predictSlots
  if (errors || !predictSlots || predictSlots.length === 0) {
    return slots;
  }

  // Append new slots to existing ones
  slots.push(...predictSlots);
  
  if (predictSlots.length === records_per_page) {
      // If we returned max results, resively get remaining data
      return getSlots(subgraphURL, address, slot24h, skip + records_per_page, slots)
  } else {
      // All data retrieved
      return slots
  }
}

export const fetchSlots24Hours = async(
  subgraphURL: string,
  assets: string[]
): Promise<Record<string, Array<TPredictSlots>>> => {
    console.log("assets", assets)  
  
    const { data, errors } = await graphqlClientInstance.query<TGetPredictContracts24hQueryResult>(
      GET_PREDICT_CONTRACTS_24H,
      { assetIds: assets },
      subgraphURL
    )

    const predictoorSlots: Record<string, Array<TPredictSlots>> = {}  
    const predictContracts = data?.predictContracts
    
    if (errors || !predictContracts || predictContracts.length === 0) {
      return predictoorSlots;
    }

    // Iterate through contracts and get slots from 24h ago
    for (const predictoor of predictContracts) {
      if (!predictoor.slots || predictoor.slots.length === 0) {
        predictoorSlots[predictoor.id] = []
        continue
      }
      
      const lastSlot = predictoor.slots[0].slot
      const slot24h = lastSlot - SECONDS_IN_24_HOURS

      // Fetch slots for the given asset ID and 24-hour slot
      const slots = await getSlots(
        subgraphURL, 
        predictoor.id,
        slot24h
      )

      predictoorSlots[predictoor.id] = slots || []
    }

    return predictoorSlots;
}

// Function to process slots and calculate average accuracy per predictContract
export const calculateAverageAccuracy = async(
  subgraphURL: string,
  assets: string[]
): Promise<Record<string, number>> => {
  const slotsData = await fetchSlots24Hours(subgraphURL, assets);
  console.log("slotData: ", slotsData);
  const contractAccuracy: Record<string, number> = {};

  for (const assetId in slotsData) {
      let totalSlots = 0;
      let correctPredictions = 0;

      if (!slotsData[assetId] || slotsData[assetId].length === 0) {
        contractAccuracy[assetId] = 0;
        continue
      }

      // TODO - Remove when slots are available
      for (const slot of slotsData[assetId]) {
        console.log("calc dummy slot");

        let mockRoundSumStakesUp = Math.random() * 1000000;
        let mockRoundSumStakes = Math.random() * 1000000;

        // create random boolean value
        let trueValue = Math.random() < 0.5;

        const prediction = calculatePrediction(
          mockRoundSumStakesUp.toString(),
          mockRoundSumStakes.toString()
        )

        // Check if prediction direction matches true value
        if (prediction.dir === (trueValue ? 1 : 0)) {
          correctPredictions++;
        }

        totalSlots++;
      }

      // TODO - Enable when slots are available
      // for (const slot of slotsData[assetId]) {
      //     const prediction = calculatePrediction(
      //       slot.roundSumStakesUp.toString(),
      //       slot.roundSumStakes.toString()
      //     )

      //     // Check if prediction direction matches true value
      //     const hasAnswer = slot.trueValues ? true : false;
      //     if (
      //       hasAnswer === true &&
      //       prediction.dir === (slot.trueValues?.trueValue ? 1 : 0)
      //     ) {
      //       correctPredictions++;
      //     }

      //     totalSlots++;
      // }

      const averageAccuracy = (correctPredictions / totalSlots) * 100;
      contractAccuracy[assetId] = averageAccuracy;
  }

  return contractAccuracy;
}