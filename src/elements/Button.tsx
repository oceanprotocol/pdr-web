import styles from '../styles/Button.module.css'

interface ButtonProps {
  text: string
  textOnly?: boolean
  disabled?: boolean
  className?: string
  onClick: () => void
}

export default function Button({
  text,
  textOnly,
  disabled,
  onClick,
  className
}: ButtonProps) {
  return (
    <button
      onClick={() => onClick()}
      className={`${className ? className : styles.button} ${
        textOnly && styles.textOnly
      }`}
      disabled={disabled}
    >
      {text}
    </button>
  )
}
