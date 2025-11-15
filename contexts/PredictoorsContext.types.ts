import Predictoor from '@/utils/contracts/Predictoor'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { Maybe } from '@/utils/utils'

export type TPredictoorsContext = {
  predictoorInstances: Array<Predictoor>
  checkAndAddInstance: (data: Predictoor) => void
  getPredictorInstanceByAddress: (address: string) => Predictoor | undefined
  runCheckContracts: () => void
  getUserSignature: () => void
  setCurrentEpoch: (data: number) => void
  setIsNewContractsInitialized: (data: boolean) => void
  contracts: Record<string, TPredictionContract> | undefined
  subscribedPredictoors: Array<Predictoor>
  fetchingPredictions: boolean
  secondsPerEpoch: number
  currentEpoch: number
  isNewContractsInitialized: boolean
  contractPrices: Record<
    string,
    Maybe<
      Awaited<ReturnType<typeof Predictoor.prototype.getReadableContractPrice>>
    >
  >
}

export type TPredictoorsContextProps = {
  children: React.ReactNode
}
