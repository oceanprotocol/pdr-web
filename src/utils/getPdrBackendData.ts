import { TAccuracyStatistics } from '@/contexts/AccuracyContext.types'
import { currentConfig } from './appconstants'
import { accuracyStatisticsEndpoint } from './endpoints/pdrBackendEndpoints'
import { Maybe } from './utils'

export const getAccuracyData = async (): Promise<
  Maybe<TAccuracyStatistics>
> => {
  try {
    const response = await fetch(
      accuracyStatisticsEndpoint(currentConfig.statisticsURL)
    )
    if (!response.ok) {
      throw new Error(
        `Failed to fetch accuracy data. Status: ${response.status}`
      )
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    return null
  }
}
