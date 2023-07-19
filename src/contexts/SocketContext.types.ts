import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { Maybe } from '@/utils/utils'
import { Socket } from 'socket.io-client'

export type TSocketProviderProps = {
  children: React.ReactNode
}

export type TSocketFeedItem = {
  predictions: Array<{
    nom: string
    denom: string
    confidence: number
    dir: number
    stake: number
    epoch: number
    epochStartBlockNumber: number
    blocksPerEpoch: number
    currentBlockNumber: number
  }>
  contractInfo: TPredictionContract
}

export type TSocketFeedData = Array<TSocketFeedItem>

export type TSocketContext = {
  epochData: TSocketFeedData | null
  socket: Socket | null
  setInitialData: (data: Maybe<TSocketFeedData>) => void
}
