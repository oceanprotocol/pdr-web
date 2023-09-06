import { calculatePrediction } from '@/utils/calculatePrediction'
import { getLatestTimestamp } from '@/utils/getLatestBlockTimestamp'
import { graphqlClientInstance } from '@/utils/graphqlClient'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import {
  TGetHistoryDataReturn,
  getHistoryDataQuery
} from '@/utils/subgraphs/queries/getHistoryData'
import { createContext, useCallback, useContext, useState } from 'react'
import {
  TPredictionHistoryContext,
  TPredictionHistoryContextProps
} from './PredictionHistoryContext.types'

/**
 * @description
 * This context is used to store the history of the predictions
 * made on the blockchain.
 */
export const PredictionHistoryContext =
  createContext<TPredictionHistoryContext>({
    historyData: [],
    renewHistory: () => {},
    clearHistory: () => {},
    getDataFromHistoryByContractAddress: () => null
  })

/**
 * @description
 * This hook is used to access the PredictionHistoryContext.
 */
export const usePredictionHistoryContext = () =>
  useContext(PredictionHistoryContext)

/**
 * @description
 * This provider is used to store the history of the predictions
 * on the Context.
 * It is used to display the history of the predictions on the
 * Predictoors page.
 */
export const PredictionHistoryProvider: React.FC<
  TPredictionHistoryContextProps
> = ({ children }) => {
  const [historyData, setHistoryData] = useState<
    TPredictionHistoryContext['historyData']
  >([])

  /**
   * @description
   * This function is used to get the history of the predictions
   * from the subgraph.
   * @argument contracts: Record<string, TPredictionContract>
   * @returns Promise<TGetHistoryDataReturn>
   */
  const getHistoryFromSubgraph = useCallback<
    (args: {
      contracts: Record<string, TPredictionContract>
    }) => Promise<TGetHistoryDataReturn>
  >(async ({ contracts }) => {
    if (!contracts) return Promise.reject()

    const SPE = contracts[Object.keys(contracts)[0]].secondsPerEpoch

    const latestTimestamp = await getLatestTimestamp()

    if (!latestTimestamp) return Promise.reject()

    const lastTwoEpochs = latestTimestamp - parseInt(SPE) * 2

    return new Promise((resolve, reject) => {
      graphqlClientInstance
        .query<TGetHistoryDataReturn>(getHistoryDataQuery, {
          slot_gte: lastTwoEpochs,
          slot_lte: latestTimestamp,
          predictionContracts: Object.values(contracts).map(
            (contract) => contract.address
          )
        })
        .then((result) => {
          if (result.data) {
            resolve(result.data)
          } else {
            reject()
          }
        })
    })
  }, [])

  /**
   * @description
   * This function is used to renew the history of the predictions
   * @argument contracts: Record<string, TPredictionContract>
   * @returns void
   */
  const renewHistory = useCallback<
    (args: { contracts: Record<string, TPredictionContract> }) => void
  >(
    ({ contracts }) => {
      getHistoryFromSubgraph({ contracts }).then((result) => {
        if (!result.predictSlots) return

        const historyData = result.predictSlots.map((item) => ({
          predictContractId: item.predictContract.id,
          slot: item.slot,
          prediction: calculatePrediction(
            item.roundSumStakesUp.toString(),
            item.roundSumStakes.toString()
          )
        }))

        setHistoryData(historyData)
      })
    },
    [setHistoryData, getHistoryFromSubgraph]
  )

  /**
   * @description
   * This function is used to clear the history of the predictions
   */
  const clearHistory = useCallback(() => {
    setHistoryData([])
  }, [setHistoryData])

  /**
   * @description
   * This function is used to get the history of the predictions
   * by contract address.
   * @argument contractAddress: string
   * @returns TPredictionHistoryContext['getDataFromHistoryByContractAddress']
   * @returns null if no data is found
   * @returns TPredictionHistoryContext['historyData'] if data is found
   */
  const getDataFromHistoryByContractAddress = useCallback<
    TPredictionHistoryContext['getDataFromHistoryByContractAddress']
  >(
    ({ contractAddress }) => {
      const data = historyData.filter(
        (item) => item.predictContractId === contractAddress
      )
      return data.length
        ? data.map((item) => ({ ...item.prediction, slot: item.slot }))
        : null
    },
    [historyData]
  )

  return (
    <PredictionHistoryContext.Provider
      value={{
        historyData,
        renewHistory,
        clearHistory,
        getDataFromHistoryByContractAddress
      }}
    >
      {children}
    </PredictionHistoryContext.Provider>
  )
}
