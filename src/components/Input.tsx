import styles from '@/styles/Input.module.css'

interface InputProps {
  type: string
  onChange?: (inputValue: any) => void // eslint-disable-next-line
  placeholder?: string
  value?: any | undefined
  label?: string
  disabled?: boolean
  min?: number
  max?: number
}

export default function Input({
  type,
  label,
  placeholder,
  onChange,
  value,
  disabled,
  min,
  max
}: InputProps) {
  return (
    <div className={styles.container}>
      {label ? <label>{label}</label> : ''}
      <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        value={value}
        disabled={disabled}
        max={max}
        min={min}
      />
    </div>
  )
}
