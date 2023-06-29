import { TInitialData } from '@/utils/getInitialData'
import { Socket } from 'socket.io-client'

export type TSocketProviderProps = {
  children: React.ReactNode
}

export type TSocketContractInfo = {
  name: string
  address: string
  symbol: string
  blocksPerEpoch: string
  blocksPerSubscription: string
  last_submitted_epoch: number
}

export type TSocketFeedItem = {
  predictions: Array<{
    nom: string
    denom: string
    confidence: number
    dir: number
    stake: number
    epoch: number
    contractAddress: string
  }>
  contractInfo: TSocketContractInfo
}

export type TSocketFeedData = Array<TSocketFeedItem>

export type TSocketContext = {
  epochData: TSocketFeedData | null
  socket: Socket | null
  setInitialData: (data: TInitialData) => void
}
