import styles from '../styles/Banner.module.css'

export default function TechnicalIssuesBanner() {
  const message = 'We are currently experiencing technical issues and Predictoor is temporarily unavailable. Please rest assured that your funds remain completely safe. Rewards distribution will resume as soon as the issue is resolved. Thank you for your patience and understanding.'
  
  return (
    <div className={`${styles.container} ${styles.warning}`}>
      <span className={styles.text}>{message}</span>
    </div>
  )
}
