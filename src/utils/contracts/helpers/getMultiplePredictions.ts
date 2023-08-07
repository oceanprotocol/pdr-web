import { TPredictedEpochLogItem } from '@/hooks/useBlockchainListener'
import Predictoor from '../Predictoor'

export type TGetMultiplePredictionsArgs = {
  currentBlockNumber: number
  epochs: Array<number>
  contracts: Array<Predictoor>
  userWallet: string
  registerPrediction?: (args: {
    contractAddress: string
    item: TPredictedEpochLogItem
  }) => void
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
  registerPrediction
}: TGetMultiplePredictionsArgs): TGetMultiplePredictionsResult =>
  Promise.all(
    epochs.flatMap((epoch) =>
      contracts.map(async (contract) => {
        const epochStartTs =
          await contract.getCurrentEpochStartTs(currentBlockNumber)
        const secondsPerEpoch = await contract.getSecondsPerEpoch()
        const aggPredVal = await contract.getAggPredval(epoch, userWallet)
        if (!aggPredVal) return null

        const predVal = {
          ...aggPredVal,
          epoch,
          epochStartTs,
          secondsPerEpoch,
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
