import styles from '../styles/Banner.module.css'

export default function TechnicalIssuesBanner() {
  const message = 'Predictoor is having technical issues and temporarily unavailable, rewards distribution will continue once the problem is resolved. Funds are safe'
  
  return (
    <div className={`${styles.container} ${styles.warning}`}>
      <span className={styles.text}>{message}</span>
    </div>
  )
}