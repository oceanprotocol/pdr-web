import { Maybe } from '@/utils/utils'
import { ClipLoader } from 'react-spinners'
import styles from '../styles/Accuracy.module.css'

type TAccuracyProps = {
  accuracy: Maybe<number>
}

export default function Accuracy({ accuracy }: TAccuracyProps) {
  // function receives accuracy as a number and returns a string
  // if accurcy has no decimals, add ".0" to the end
  // if accuracy has decimals, return accuracy with one decimal
  const getFormattedAccuracy = (
    accuracy: NonNullable<TAccuracyProps['accuracy']>
  ): string => {
    if (accuracy % 1 === 0) {
      return `${accuracy}.0`
    } else {
      return `${accuracy.toFixed(1)}`
    }
  }

  return (
    <div className={styles.container}>
      {accuracy !== null ? (
        <span className={styles.accuracy}>{`${getFormattedAccuracy(
          accuracy
        )}`}</span>
      ) : (
        <ClipLoader size={12} color="var(--dark-grey)" loading={true} />
      )}
      %
    </div>
  )
}
