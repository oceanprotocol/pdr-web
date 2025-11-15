import { ElementOf, Maybe, ValueOfRecord } from '@/utils/utils'

export type TAccuracyContext = {
  accuracyStatistics: Maybe<TAccuracyStatistics>
  isAccuracyStatisticsLoading: boolean
}

export type TAccuracyContextProps = {
  children: React.ReactNode
}

export type TSingleAccuracyStatistics = {
  average_accuracy: number
  total_staked_today: number
  total_staked_yesterday: number
}

export type TAccuracyStatistics = Array<{
  alias: string
  statistics: {
    [key: string]: TSingleAccuracyStatistics
  }
}>

export type TGetAccuracyStatisticsByTokenName = (args: {
  contractAddress: string
  accuracyData: Maybe<TAccuracyStatistics>
  timeFrameInterval: string
}) => Maybe<ValueOfRecord<ElementOf<TAccuracyStatistics>['statistics']>>
