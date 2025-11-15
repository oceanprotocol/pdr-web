import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { Maybe } from '@/utils/utils'
import { TPredictedEpochLogItem } from './PredictoorsContext'
import { TPredictoorsContext } from './PredictoorsContext.types'

export type TFilterAllowedContractsArgs = {
  contracts: Record<string, TPredictionContract>
  opfOwnerAddress: string
  allowedPredConfig: Maybe<Array<string>>
}

export const filterAllowedContracts = ({
  contracts,
  opfOwnerAddress,
  allowedPredConfig
}: TFilterAllowedContractsArgs) => {
  const filteredContracts: Record<string, TPredictionContract> = {}
  const filterMethod = allowedPredConfig
    ? (contractKey: string) => allowedPredConfig.includes(contractKey)
    : (contractKey: string) => contracts[contractKey].owner === opfOwnerAddress

  Object.keys(contracts).forEach((contractKey) => {
    if (filterMethod(contractKey)) {
      filteredContracts[contractKey] = contracts[contractKey]
    }
  })

  return filteredContracts
}

// filterIntervalContracts({ contracts, interval })
export type TFilterIntervalContractsArgs = {
  contracts: Record<string, TPredictionContract>
  interval: string
}

// export const filterIntervalContracts
// finds all contracts by the same interval
export const filterIntervalContracts = ({
  contracts,
  interval
}: TFilterIntervalContractsArgs) => {
  const filteredContracts: Record<string, TPredictionContract> = {}

  // create filterMethod that checks if the contract interval matches the interval passed in
  const filterMethod = (contractKey: string) => {
    return contracts[contractKey].interval === interval
  }

  // loop through all contracts and add the ones that match the interval to the filteredContracts object
  Object.keys(contracts).forEach((contractKey) => {
    if (filterMethod(contractKey)) {
      filteredContracts[contractKey] = contracts[contractKey]
    }
  })

  return filteredContracts
}

export type TDetectNewEpochsArgs = {
  subscribedPredictoors: TPredictoorsContext['subscribedPredictoors']
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
