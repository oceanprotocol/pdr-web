import { EEpochDisplayStatus } from '../EpochDisplay'

export type TEpochDirectionProps = {
  direction: number
  confidence: number
  delta: number | undefined
  status: EEpochDisplayStatus
}

export const EpochDirection: React.FC<TEpochDirectionProps> = ({
  direction,
  confidence,
  delta,
  status
}) => {
  const getDirectionText = (direction: number) => {
    return direction == 1 ? 'BULL' : 'BEAR'
  }
  return (
    <span>
      {status !== EEpochDisplayStatus.LivePrediction
        ? `${parseFloat(confidence.toString()).toFixed(0)}% ${getDirectionText(
            direction
          )}`
        : `${delta}%`}
    </span>
  )
}
