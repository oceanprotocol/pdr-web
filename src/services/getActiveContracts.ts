import { getActiveContractsEndpoint } from '@/utils/endpoints/apiEndpoints'
import {
  TConsumedSubscription,
  TSubscriptionStartedResult
} from '@/utils/predictoors'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { Maybe } from '@/utils/typeHelpers'

export const getActiveContracts = async (): Promise<
  Array<TPredictionContract> | Error
> => {
  return new Promise((resolve, reject) => {
    fetch(getActiveContractsEndpoint())
      .then((response) => response.json())
      .then(
        (
          data: Maybe<Array<TSubscriptionStartedResult | TConsumedSubscription>>
        ) => {
          if (!data) {
            reject(new Error('No data'))
            return
          }

          console.log('getActiveContracts-data', data)

          resolve(data.map((item) => item.predictionContract))
        }
      )
      .catch((error) => {
        reject(error)
      })
  })
}
