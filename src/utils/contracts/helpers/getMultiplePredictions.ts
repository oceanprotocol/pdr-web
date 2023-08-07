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
  currentTs,
  epochs,
  contracts,
  userWallet,
  registerPrediction
}: TGetMultiplePredictionsArgs): TGetMultiplePredictionsResult =>
  Promise.all(
    epochs.flatMap((epoch) =>
      contracts.map(async (contract) => {
        const epochStartTs =
          await contract.getCurrentEpochStartTs(currentTs)
        const secondsPerEpoch = await contract.getSecondsPerEpoch()
        const aggPredVal = await contract.getAggPredval(epoch, userWallet)
        if (!aggPredVal) return null

        const predVal = {
          ...aggPredVal,
          epoch,
          epochStartTs,
          secondsPerEpoch,
          currentTs
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
