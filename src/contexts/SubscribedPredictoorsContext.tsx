import Predictoor from '@/utils/contracts/Predictoor'
import { createContext, useCallback, useContext, useState } from 'react'
import {
  TSubscribedPredictoorsContext,
  TSubscribedPredictoorsContextProps
} from './SubscribedPredictoorsContext.types'

// SubscribedPredictoorsContext
export const SubscribedPredictoorsContext =
  createContext<TSubscribedPredictoorsContext>({
    predictorInstances: [],
    checkAndAddInstance: (data) => {},
    getPredictorInstanceByAddress: (data) => undefined
  })

// Custom hook to use the SubscribedPredictoorsContext
export const useSubscribedPredictoorsContext = () => {
  return useContext(SubscribedPredictoorsContext)
}

export const SubscribedPredictoorsProvider: React.FC<
  TSubscribedPredictoorsContextProps
> = ({ children }) => {
  const [predictorInstances, setPredictorInstances] = useState<
    TSubscribedPredictoorsContext['predictorInstances']
  >([])

  const checkIfContractIsSubscribed = useCallback(
    (contractAddress: string) => {
      return predictorInstances.some(
        (predictorInstance) => predictorInstance.address === contractAddress
      )
    },
    [predictorInstances]
  )

  const getPredictorInstanceByAddress = useCallback(
    (contractAddress: string) => {
      return predictorInstances.find(
        (predictorInstance) => predictorInstance.address === contractAddress
      )
    },
    [predictorInstances]
  )

  const checkAndAddInstance = useCallback(
    (predictorInstance: Predictoor) => {
      if (!checkIfContractIsSubscribed(predictorInstance.address)) {
        setPredictorInstances((prevState) => [...prevState, predictorInstance])
      }
    },
    [checkIfContractIsSubscribed]
  )

  return (
    <SubscribedPredictoorsContext.Provider
      value={{
        predictorInstances,
        checkAndAddInstance,
        getPredictorInstanceByAddress
      }}
    >
      {children}
    </SubscribedPredictoorsContext.Provider>
  )
}
