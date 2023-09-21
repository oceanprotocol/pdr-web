import { TSocketFeedData } from '@/contexts/SocketContext.types'
import { currentConfig } from '@/utils/appconstants'
import { pdrwebInitialData } from './endpoints/pdrwebEndpoints'
import { Maybe } from './utils'


export const getInitialData = async (): Promise<Maybe<TSocketFeedData>> => {
  return fetch(pdrwebInitialData(currentConfig.websocketURL))
    .then((response) => response.json())
    .then((response) => {
      // Response can return an error
      const errorMessage = response?.message
      
      // check if "No data available" is inside message so it can be handled correctly
      if( errorMessage && errorMessage.includes("No data available") )
        return null
      
      return response
    })
    .catch((error) => {
      console.error(error)
    })
}
