import { CustomBanner } from '@/components/CustomBanner'
import styles from '../styles/Banner.module.css'

export const DATA_FARMING_DOCS_URL =
  'https://docs.oceanprotocol.com/data-farming/predictoordf'

export default function RewardsChangeBanner() {
  return (
    <CustomBanner bannerType="pink">
      <span className={styles.text}>
        <span className={styles.fw600}>
          Predictoor Data Farming rewards have changed.
        </span>{' '}
        <a
          className={styles.link}
          href={DATA_FARMING_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the docs for more details
        </a>
      </span>
    </CustomBanner>
  )
}
