import { EPredictoorContractInterval } from '@/utils/types/EPredictoorContractInterval'

export type TTimeFrameContext = {
  timeFrameInterval: EPredictoorContractInterval
  setTimeFrameInterval: (data: EPredictoorContractInterval) => void
}

export type TTimeFrameContextProps = {
  defaultTimeFrameInterval: EPredictoorContractInterval
  children: React.ReactNode
}
