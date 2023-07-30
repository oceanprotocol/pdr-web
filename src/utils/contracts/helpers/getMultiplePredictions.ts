import { TPredictedEpochLogItem } from '@/contexts/PredictoorsContext'
import { ethers } from 'ethers'
import Predictoor, { TAuthorizationUser } from '../Predictoor'

export type TGetMultiplePredictionsArgs = {
  currentBlockNumber: number
  epochs: Array<number>
  contracts: Array<Predictoor>
  userWallet: ethers.Signer
  registerPrediction?: (args: {
    contractAddress: string
    item: TPredictedEpochLogItem
  }) => void
  authorizationData?: TAuthorizationUser
}

export type TGetMultiplePredictionsResult = Promise<
  Array<
    | (TPredictedEpochLogItem & {
        contractAddress: string
      })
    | null
  >
>

export const getMultiplePredictions = ({
  currentBlockNumber,
  epochs,
  contracts,
  userWallet,
  registerPrediction,
  authorizationData
}: TGetMultiplePredictionsArgs): TGetMultiplePredictionsResult =>
  Promise.all(
    epochs.flatMap((epoch) =>
      contracts.map(async (contract) => {
        const epochStartBlockNumber =
          await contract.getCurrentEpochStartBlockNumber(currentBlockNumber)
        const blocksPerEpoch = await contract.getBlocksPerEpoch()

        if (!authorizationData) return null

        const aggPredVal = await contract.getAggPredval(
          epoch,
          userWallet,
          authorizationData
        )
        if (!aggPredVal) return null

        const predVal = {
          ...aggPredVal,
          epoch,
          epochStartBlockNumber,
          blocksPerEpoch,
          currentBlockNumber
        }
        if (registerPrediction)
          registerPrediction({
            contractAddress: contract.address,
            item: predVal
          })
        return { ...predVal, contractAddress: contract.address }
      })
    )
  )
