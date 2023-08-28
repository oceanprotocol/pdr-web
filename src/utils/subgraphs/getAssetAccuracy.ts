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
  slots: Record<string, Array<TPredictSlots>> = {}
): Promise<Record<string, Array<TPredictSlots>>> => {
  const { data, errors } = await graphqlClientInstance.query<TGetPredictSlots24hQueryResult>(
    GET_PREDICT_SLOTS_24H,
    {
      asset: address,
      initialSlot: slot24h,
      first: 1000,
      skip: skip,
    },
    subgraphURL
  )
  
  const predictSlots = data?.predictSlots
  if (errors || !predictSlots || predictSlots.length === 0) {
    return slots;
  }

  // Initialize the array if it doesn't exist
  if (!slots[address]) {
    slots[address] = [];
  }

  // Append new slots to existing ones
  slots[address].push(...predictSlots);
  
  if (predictSlots.length === 1000) {
      // If we returned max results, resively get remaining data
      return getSlots(subgraphURL, address, slot24h, skip + 1000, slots)
  } else {
      // All data retrieved
      return slots
  }
}

export const fetchSlots24Hours = async(
  subgraphURL: string,
  assets: string[]
): Promise<Record<string, Array<TPredictSlots>>> => {
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
      const lastSlot = predictoor.slots.slot
      const slot24h = lastSlot - (SECONDS_IN_24_HOURS + predictoor.secondsPerEpoch)

      // Fetch slots for the given asset ID and 24-hour slot
      const slots = await getSlots(
        subgraphURL, 
        predictoor.id, 
        slot24h
      )

      // Merge slots for this asset ID
      predictoorSlots[predictoor.id] = slots[predictoor.id] || []
    }

    return predictoorSlots;
}

type ContractAverageAccuracyMap = Record<string, number>;

// Function to process slots and calculate average accuracy per predictContract
async function calculateAverageAccuracy(
  subgraphURL: string,
  assets: string[]
): Promise<ContractAverageAccuracyMap> {
  const slotsData = await fetchSlots24Hours(subgraphURL, assets);

  const contractAccuracyMap: ContractAverageAccuracyMap = {};

  for (const assetId in slotsData) {
      let totalSlots = 0;
      let correctPredictions = 0;

      for (const slot of slotsData[assetId]) {
          const prediction = calculatePrediction(
            slot.roundSumStakesUp.toString(),
            slot.roundSumStakes.toString()
          )

          // Check if prediction direction matches true value
          if (prediction.dir === (slot.trueValues.trueValue ? 1 : 0)) {
            correctPredictions++;
          }

          totalSlots++;
      }

      const averageAccuracy = (correctPredictions / totalSlots) * 100;
      contractAccuracyMap[assetId] = averageAccuracy;
  }

  return contractAccuracyMap;
}