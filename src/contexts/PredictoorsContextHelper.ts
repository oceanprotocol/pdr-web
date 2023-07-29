import { TPredictedEpochLogItem } from '@/hooks/useBlockchainListener'
import Predictoor from '@/utils/contracts/Predictoor'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'

export type TFilterAllowedContractsArgs = {
  contracts: Record<string, TPredictionContract>
  opfOwnerAddress: string
}

export const filterAllowedContracts = ({
  contracts,
  opfOwnerAddress
}: TFilterAllowedContractsArgs) => {
  const filteredContracts: Record<string, TPredictionContract> = {}
  Object.keys(contracts).forEach((contractKey) => {
    if (contracts[contractKey].owner === opfOwnerAddress) {
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
