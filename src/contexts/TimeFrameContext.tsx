import { EPredictoorContractInterval } from '@/utils/types/EPredictoorContractInterval'
import { createContext, useContext, useState } from 'react'
import {
  TTimeFrameContext,
  TTimeFrameContextProps
} from './TimeFrameContext.types'

export const TimeFrameContext = createContext<TTimeFrameContext>({
  timeFrameInterval: EPredictoorContractInterval.e_5M,
  setTimeFrameInterval: (data) => {}
})

export const useTimeFrameContext = () => {
  return useContext(TimeFrameContext)
}

export const TimeFrameProvider: React.FC<TTimeFrameContextProps> = ({
  defaultTimeFrameInterval,
  children
}) => {
  const [timeFrameInterval, setTimeFrameInterval] =
    useState<EPredictoorContractInterval>(defaultTimeFrameInterval)

  return (
    <TimeFrameContext.Provider
      value={{
        timeFrameInterval,
        setTimeFrameInterval
      }}
    >
      {children}
    </TimeFrameContext.Provider>
  )
}
