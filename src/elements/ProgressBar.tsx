import { default as ProgressBarComponent } from '@ramonak/react-progress-bar'
import styles from '../styles/ProgressBar.module.css'

// TODO - Make it update without it being based on time
// Maybe clean up a separate 
interface ProgressBarProps {
  progress: number
  max: number
}

export default function ProgressBar({
  progress,
  max
}: ProgressBarProps) {
  return (
    <ProgressBarComponent
      completed={progress}
      maxCompleted={max}
      bgColor="#FF9E9E"
      baseBgColor="#FFFFFF"
      width="100%"
      height="5px"
      className={styles.wrapper}
      isLabelVisible={false}
    />
  )
}
