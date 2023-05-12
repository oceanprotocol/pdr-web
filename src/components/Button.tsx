import styles from '../styles/Button.module.css'

interface ButtonProps {
  text: string
  onClick: () => void
}

export default function Button({ text, onClick }: ButtonProps) {
  return (
    <button onClick={() => onClick()} className={styles.button}>
      {text}
    </button>
  )
}
