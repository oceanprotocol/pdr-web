import { TAccuracyStatistics } from '@/contexts/AccuracyContext.types'
import { currentConfig } from './appconstants'
import { accuracyStatisticsEndpoint } from './endpoints/pdrBackendEndpoints'
import { Maybe } from './utils'

export const getAccuracyData = async (): Promise<Maybe<TAccuracyStatistics>> =>
  fetch(accuracyStatisticsEndpoint(currentConfig.statisticsURL))
    .then((response) => response.json())
    .then((response) => {
      // Response can return an error
      const errorMessage = response?.message

      // check if "No data available" is inside message so it can be handled correctly
      if (
        response?.error ||
        errorMessage ||
        errorMessage.includes('No data available')
      ) {
        console.error(errorMessage)
        return null
      }

      return response
    })
    .catch((error) => {
      console.error(error)
    })
