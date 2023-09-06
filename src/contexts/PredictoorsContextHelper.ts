import Predictoor from '@/utils/contracts/Predictoor'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { Maybe } from '@/utils/utils'
import { TPredictedEpochLogItem } from './PredictoorsContext'

export type TFilterAllowedContractsArgs = {
  contracts: Record<string, TPredictionContract>
  opfOwnerAddress: string
  allowedPredConfig: Maybe<Array<string>>
  blacklistPredConfig: Maybe<Array<string>>
}

export const filterAllowedContracts = ({
  contracts,
  opfOwnerAddress,
  allowedPredConfig,
  blacklistPredConfig
}: TFilterAllowedContractsArgs) => {
  const filteredContracts: Record<string, TPredictionContract> = {}
  const filterMethod = allowedPredConfig
    ? (contractKey: string) => allowedPredConfig.includes(contractKey)
    : (contractKey: string) => contracts[contractKey].owner === opfOwnerAddress
  
  const blacklistMethod = blacklistPredConfig
    ? (contractKey: string) => blacklistPredConfig.includes(contractKey)
    : (contractKey: string) => contracts[contractKey].owner === opfOwnerAddress

  Object.keys(contracts).forEach((contractKey) => {
    if (filterMethod(contractKey) && !blacklistMethod(contractKey)) {
      filteredContracts[contractKey] = contracts[contractKey]
    }
  })

  return filteredContracts
}

export type TDetectNewEpochsArgs = {
  subscribedPredictoors: Array<Predictoor>
  predictionEpochs: Array<number>
  predictedEpochs?: Record<string, Array<TPredictedEpochLogItem>>
}

export const detectNewEpochs = ({
  subscribedPredictoors,
  predictionEpochs,
  predictedEpochs
}: TDetectNewEpochsArgs) => {
  const newEpochsSet = new Set<number>()

  subscribedPredictoors.forEach((contract) => {
    predictionEpochs.forEach((epoch) => {
      if (
        !predictedEpochs ||
        !predictedEpochs[contract.address]
          ?.map((item) => item.epoch)
          .includes(epoch)
      ) {
        newEpochsSet.add(epoch)
      }
    })
  })
  return Array.from(newEpochsSet)
}
