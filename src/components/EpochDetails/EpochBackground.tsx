import styles from '@/styles/Epoch.module.css'

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
      backgroundColor: `rgba(${direction == 1 ? '102,207,0' : '220,20,60'}, ${
        stake / 100000000000
      })`
    }}
  ></div>
)
