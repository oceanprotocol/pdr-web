import { TSocketFeedData } from '@/contexts/SocketContext.types'
import { pdrwebInitialData } from './endpoints/pdrwebEndpoints'
import { Maybe } from './utils'

export const getInitialData = async (): Promise<Maybe<TSocketFeedData>> => {
  return fetch(pdrwebInitialData())
    .then((response) => response.json())
    .then((response) => {
      return response
    })
    .catch((error) => {
      console.error(error)
    })
}
