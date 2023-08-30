import Predictoor from '@/utils/contracts/Predictoor'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { Maybe } from '@/utils/utils'

export type TPredictoorsContext = {
  predictoorInstances: Array<Predictoor>
  checkAndAddInstance: (data: Predictoor) => void
  getPredictorInstanceByAddress: (address: string) => Predictoor | undefined
  runCheckContracts: () => void
  contracts: Record<string, TPredictionContract> | undefined
  subscribedPredictoors: Array<Predictoor>
  contractPrices: Record<
    string,
    Maybe<
      Awaited<ReturnType<typeof Predictoor.prototype.getReadableContractPrice>>
    >
  >
  contractAverages: Record<
    string,
    number
  >
}

export type TPredictoorsContextProps = {
  children: React.ReactNode
}
