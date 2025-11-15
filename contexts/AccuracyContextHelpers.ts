import { TGetAccuracyStatisticsByTokenName } from './AccuracyContext.types'

export const getAccuracyStatisticsByTokenName: TGetAccuracyStatisticsByTokenName =
  ({ contractAddress, accuracyData, timeFrameInterval }) => {
    if (!accuracyData) {
      return null
    }

    return (
      accuracyData.find((data) => data.alias === timeFrameInterval)?.statistics[
        contractAddress
      ] || null
    )
  }
