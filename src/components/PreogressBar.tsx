import { default as ProgressBarComponent } from '@ramonak/react-progress-bar'
import { useEffect } from 'react'
import styles from '../styles/ProgressBar.module.css'

interface ProgressBarProps {
  completed: number
  maxCompleted: number
  setCompleted: (number: number) => void
}

export default function ProgressBar({
  completed,
  maxCompleted,
  setCompleted
}: ProgressBarProps) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (completed < maxCompleted) {
        setCompleted(completed + 1)
      } else {
        clearInterval(intervalId)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [completed, maxCompleted])
  return (
    <ProgressBarComponent
      completed={completed}
      maxCompleted={maxCompleted}
      bgColor="purple"
      baseBgColor="grey"
      width="100%"
      height="5px"
      className={styles.wrapper}
      isLabelVisible={false}
    />
  )
}
