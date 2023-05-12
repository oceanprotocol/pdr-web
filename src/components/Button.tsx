import styles from '../styles/Button.module.css'

interface ButtonProps {
  text: string
  disabled?: boolean
  onClick: () => void
}

export default function Button({ text, disabled, onClick }: ButtonProps) {
  return (
    <button
      onClick={() => onClick()}
      className={styles.button}
      disabled={disabled}
    >
      {text}
    </button>
  )
}
