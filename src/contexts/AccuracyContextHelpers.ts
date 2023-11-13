import { TGetAccuracyStatisticsByTokenName } from './AccuracyContext.types'

export const getAccuracyStatisticsByTokenName: TGetAccuracyStatisticsByTokenName =
  ({ contractAddress, accuracyData, timeFrameInterval }) => {
    if (!accuracyData) {
      return null
    }
    const s = accuracyData.find(
      (data) => data.alias === timeFrameInterval
    )?.statistics

    console.log('eeee', s)

    return (
      accuracyData.find((data) => data.alias === timeFrameInterval)?.statistics[
        contractAddress
      ] || null
    )
  }
