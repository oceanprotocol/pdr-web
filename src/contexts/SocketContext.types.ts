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
    epochStartTsNumber: number
    secondsPerEpoch: number
    currentTs: number
  }>
  contractInfo: TPredictionContract
}

export type TSocketFeedData = Array<TSocketFeedItem>

export type TSocketContext = {
  epochData: TSocketFeedData | null
  socket: Socket | null
  initialEpochData: TSocketFeedData | null
  setInitialData: (data: Maybe<TSocketFeedData>) => void
  setEpochData: React.Dispatch<React.SetStateAction<TSocketFeedData | null>>
}
