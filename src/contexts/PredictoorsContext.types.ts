import Predictoor from '@/utils/contracts/Predictoor'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'

export type TPredictoorsContext = {
  predictoorInstances: Array<Predictoor>
  checkAndAddInstance: (data: Predictoor) => void
  getPredictorInstanceByAddress: (address: string) => Predictoor | undefined
  runCheckContracts: () => void
  contracts: Record<string, TPredictionContract> | undefined
  subscribedPredictoors: Array<Predictoor>
}

export type TPredictoorsContextProps = {
  children: React.ReactNode
}
