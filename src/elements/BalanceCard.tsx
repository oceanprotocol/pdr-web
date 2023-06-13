import styles from '../styles/BalanceCard.module.css'

type TBalanceCardProps = {
  children: React.ReactNode
}

export const BalanceCard: React.FC<TBalanceCardProps> = ({ children }) => (
  <div className={styles.container}>{children}</div>
)
