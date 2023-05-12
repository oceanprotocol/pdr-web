import { default as ProgressBarComponent } from '@ramonak/react-progress-bar'
import styles from '../styles/ProgressBar.module.css'

interface ProgressBarProps {
  completed: number
  maxCompleted: number
}

export default function ProgressBar({
  completed,
  maxCompleted
}: ProgressBarProps) {
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
