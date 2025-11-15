'use client'

import { getAccuracyData } from '@/utils/getPdrBackendData'
import { EPredictoorContractInterval } from '@/utils/types/EPredictoorContractInterval'
import { Maybe } from '@/utils/utils'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  TAccuracyContext,
  TAccuracyContextProps,
  TAccuracyStatistics
} from './AccuracyContext.types'
import { useTimeFrameContext } from './TimeFrameContext'

export const AccuracyContext = createContext<TAccuracyContext>({
  accuracyStatistics: null,
  isAccuracyStatisticsLoading: false
})

export const useAccuracyContext = () => {
  return useContext(AccuracyContext)
}

export const AccuracyProvider: React.FC<TAccuracyContextProps> = ({
  children
}) => {
  const { timeFrameInterval } = useTimeFrameContext()
  const [accuracyData, setAccuracyData] =
    useState<Maybe<TAccuracyStatistics>>(null)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true)
      getAccuracyData().then((data) => {
        setIsFetching(false)
        setAccuracyData(data)
      })
    }

    const timeframe =
      timeFrameInterval === EPredictoorContractInterval.e_1H ? 3600000 : 300000

    fetchData()
    const interval = setInterval(fetchData, timeframe)

    return () => {
      clearInterval(interval)
    }
  }, [timeFrameInterval])

  return (
    <AccuracyContext.Provider
      value={{
        accuracyStatistics: accuracyData,
        isAccuracyStatisticsLoading: isFetching
      }}
    >
      {children}
    </AccuracyContext.Provider>
  )
}
