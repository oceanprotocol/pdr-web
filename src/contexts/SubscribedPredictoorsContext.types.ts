import Predictoor from '@/utils/contracts/Predictoor'

export type TSubscribedPredictoorsContext = {
  predictorInstances: Array<Predictoor>
  checkAndAddInstance: (data: Predictoor) => void
  getPredictorInstanceByAddress: (address: string) => Predictoor | undefined
}

export type TSubscribedPredictoorsContextProps = {
  children: React.ReactNode
}
