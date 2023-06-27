import {
  TSocketContractInfo,
  TSocketFeedItem
} from '@/contexts/SocketContext.types'
import { pdrwebInitialData } from './endpoints/pdrwebEndpoints'

export type TInitialDataItem = {
  contractInfo: TSocketContractInfo
  blockNumber: number
  isValid: boolean
  aggPredVal: Pick<
    TSocketFeedItem,
    'nom' | 'denom' | 'confidence' | 'dir' | 'stake'
  >
}

export type TInitialData = {
  results: Array<TInitialDataItem>
}

export const getInitialData = async (): Promise<TInitialData> => {
  return fetch(pdrwebInitialData())
    .then((response) => response.json())
    .then((response) => {
      return response
    })
    .catch((error) => {
      console.error(error)
    })
}
