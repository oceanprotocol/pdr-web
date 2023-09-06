import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { Maybe } from '@/utils/utils'

/**
 * @name PredictionResult
 * @description
 * Data type for the prediction result
 * @property {string} nom - The numerator
 * @property {string} denom - The denominator
 * @property {number} confidence - The calculated confidence by the nom and the denom
 * @property {number} dir - The calculated direction by the nom and the denom
 * @property {number} stake - The stake of the prediction
 */
export type PredictionResult = {
  nom: string
  denom: string
  confidence: number
  dir: number
  stake: number
}

/**
 * @name TPredictionHistoryData
 * @description
 * Data type for the history data
 * @property {string} predictContractId - The predict contract id
 * @property {number} slot - The slot number
 * @property {PredictionResult} prediction - The prediction result, includes nom, denom, confidence, dir, stake
 */
export type TPredictionHistoryData = {
  predictContractId: string
  slot: number
  prediction: PredictionResult
}

/**
 * @name TPredictionHistoryContext
 * @description
 * Data type for the prediction history context
 * @property {Array<TPredictionHistoryData>} historyData - The history data
 * @property {(data: { contracts: Record<string, TPredictionContract> }) => void} renewHistory - The renew history function
 * @property {() => void} clearHistory - The clear history function
 * @property {(args: { predictContractId: string; slot: number }) => Maybe<PredictionResult>} getDataFromHistory - The get data from history function
 */
export type TPredictionHistoryContext = {
  historyData: Array<TPredictionHistoryData>
  renewHistory: (data: {
    contracts: Record<string, TPredictionContract>
  }) => void
  clearHistory: () => void
  getDataFromHistoryByContractAddress: (args: {
    contractAddress: string
  }) => Maybe<Array<TPredictionHistoryData['prediction']>>
}

/**
 * @name TPredictionHistoryContextProps
 * @description
 * Data type for the prediction history context props
 * @property {React.ReactNode} children - The children
 */
export type TPredictionHistoryContextProps = {
  children: React.ReactNode
}
