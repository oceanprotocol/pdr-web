import styles from '@/styles/Slot.module.css'

export type TEpochBackgroundProps = {
  direction: number
  stake: number
}

export const EpochBackground: React.FC<TEpochBackgroundProps> = ({
  direction,
  stake
}) => (
  <div
    className={styles.confidence}
    style={{
      backgroundColor: `rgba(${
        direction == 1 ? '124,252,0' : '220,20,60'
      }, ${stake})`
    }}
  ></div>
)
