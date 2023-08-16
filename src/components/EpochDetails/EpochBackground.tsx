import styles from '@/styles/Epoch.module.css'

export type TEpochBackgroundProps = {
  direction: number
  stake: number
  delta: number | undefined
}

export const EpochBackground: React.FC<TEpochBackgroundProps> = ({
  direction,
  stake,
  delta
}) => {
  return (
    <div
      className={styles.confidence}
      style={
        stake > 0 && delta && delta !== 0
          ? {
              backgroundColor: `rgba(${
                direction == 1 ? '102,207,0' : '220,20,60'
              }, ${stake > 0 ? stake / 5 + 0.5 : 0})`
            }
          : undefined
      }
    ></div>
  )
}
