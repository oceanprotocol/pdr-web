export type TEpochDirectionProps = {
  direction: number
  confidence: number
}

export const EpochDirection: React.FC<TEpochDirectionProps> = ({
  direction,
  confidence
}) => {
  const getDirectionText = (direction: number) => {
    return direction == 1 ? 'BULL' : 'BEAR'
  }

  return <span>{`${confidence}% ${getDirectionText(direction)}`}</span>
}
