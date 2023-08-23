import { TPredictedEpochLogItem } from '@/contexts/PredictoorsContext'
import { TAuthorization } from '@/utils/authorize'
import { ethers } from 'ethers'
import Predictoor from '../Predictoor'

export type TGetMultiplePredictionsArgs = {
  currentTs: number
  epochs: Array<number>
  contracts: Array<Predictoor>
  userWallet: ethers.Signer
  registerPrediction?: (args: {
    contractAddress: string
    item: TPredictedEpochLogItem
  }) => void
  authorizationData?: TAuthorization
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
  registerPrediction,
  authorizationData
}: TGetMultiplePredictionsArgs): TGetMultiplePredictionsResult =>
  Promise.all(
    epochs.flatMap((epoch) =>
      contracts.map(async (contract) => {
        const epochStartTs = epoch
        const secondsPerEpoch = await contract.getSecondsPerEpoch()
        console.log('authorizationData', authorizationData)
        if (!authorizationData) return null

        const aggPredVal = await contract.getAggPredval(
          epoch,
          userWallet,
          authorizationData
        )

        console.log('aggPredVal', aggPredVal)

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
