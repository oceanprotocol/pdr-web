import { CustomBanner } from '@/components/CustomBanner'
import styles from '../styles/Banner.module.css'

export const BLOGPOST_URL =
  'https://docs.oceanprotocol.com/data-farming/predictoordf'

export default function RewardsChangeBanner() {
  return (
    <CustomBanner bannerType="pink">
      <span className={styles.text}>
        <span className={styles.fw600}>
          Predictoor will be stopped on December 3rd, 2026.
        </span>{' '}
        <a
          className={styles.link}
          href={BLOGPOST_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the blogpost for more details
        </a>
      </span>
    </CustomBanner>
  )
}
