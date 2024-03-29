import { default as ProgressBarComponent } from '@ramonak/react-progress-bar'
import { useEffect, useState } from 'react'
import styles from '../styles/ProgressBar.module.css'

// TODO - Make it update without it being based on time
// Maybe clean up a separate
interface ProgressBarProps {
  progress: number
  max: number
  refreshOnData: any
}

export default function ProgressBar({
  progress,
  max,
  refreshOnData
}: ProgressBarProps) {
  const [completed, setCompleted] = useState(progress)

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (completed > 0) {
        setCompleted(completed - 1)
      } else {
        clearInterval(intervalId)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [completed, max])

  useEffect(() => {
    setCompleted(progress)
  }, [progress, refreshOnData])

  return (
    <ProgressBarComponent
      completed={completed}
      maxCompleted={max}
      bgColor="#FF9E9E"
      width="100%"
      height="3px"
      className={styles.wrapper}
      isLabelVisible={false}
    />
  )
}
