import { ReactNode } from 'react'
import styles from '../styles/Button.module.css'

export const enum ButtonType {
  'TEXT_ONLY' = 'textOnly',
  'SECONDARY' = 'secondary',
  'PRIMARY' = 'primary'
}

interface ButtonProps {
  text: string
  type?: ButtonType
  disabled?: boolean
  className?: string
  children?: ReactNode
  onClick: () => void
}

export default function Button({
  text,
  type,
  disabled,
  onClick,
  className,
  children
}: ButtonProps) {
  return (
    <button
      onClick={() => onClick()}
      className={`${className ? className : styles.button} ${
        type === ButtonType.TEXT_ONLY
          ? styles.textOnly
          : type === ButtonType.SECONDARY
          ? styles.secondary
          : ''
      }`}
      disabled={disabled}
    >
      <div className={styles.buttonContent}>
        {children}
        {text}
      </div>
    </button>
  )
}
