import { PredictionResult } from '@/utils/contracts/Predictoor';
import { calculatePrediction } from '@/utils/contracts/helpers/calculatePrediction';
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
  asset: string
): Promise<Array<TPredictSlots>> => {
    const { data, errors } = await graphqlClientInstance.query<TGetPredictContracts24hQueryResult>(
      GET_PREDICT_CONTRACTS_24H,
      { assetId: asset },
      subgraphURL
    )

    let predictoorSlots: Array<TPredictSlots> = []
    const predictContracts = data?.predictContracts
    
    if (errors || !predictContracts || predictContracts.length === 0) {
      return predictoorSlots;
    }

    // Iterate through contracts and get slots from 24h ago
    const predictoor = predictContracts[0]

    if( predictoor ) {
      if (!predictoor.slots || predictoor.slots.length === 0) {
        return predictoorSlots;
      }
      
      const lastSlot = predictoor.slots[0].slot
      const slot24h = lastSlot - SECONDS_IN_24_HOURS

      // Fetch slots for the given asset ID and 24-hour slot
      const slots = await getSlots(
        subgraphURL, 
        predictoor.id,
        slot24h
      )

      predictoorSlots = slots || []
    }

    return predictoorSlots;
}

// Function to process slots and calculate average accuracy per predictContract
export const calculateAverageAccuracy = async(
  subgraphURL: string,
  asset: string
): Promise<number> => {
  const slotsData = await fetchSlots24Hours(subgraphURL, asset);
  let totalSlots = 0;
  let correctPredictions = 0;

  if (!slotsData || slotsData.length === 0) {
    return 0.0;
  }

  // TODO - Remove when slots are available
  for (const slot of slotsData) {
    console.log("calc dummy slot");

    let mockRoundSumStakesUp = Math.random() * 1000000;
    let mockRoundSumStakes = Math.random() * 1000000;

    // create random boolean value
    let trueValue = Math.random() < 0.5;

    const prediction: PredictionResult = calculatePrediction(
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
  // for (const slot of slotsData) {
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
  return averageAccuracy;
}