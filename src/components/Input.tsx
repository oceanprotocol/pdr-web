import styles from '@/styles/Input.module.css'

interface InputProps {
  type: string
  onChange: (inputValue: any) => void // eslint-disable-next-line
  placeholder?: string
  value?: any | undefined
  label?: string
  min?: number
  max?: number
}

export default function Input({
  type,
  label,
  placeholder,
  onChange,
  value,
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
        onChange={(event) => onChange(event.target.value)}
        value={value}
        max={max}
        min={min}
      />
    </div>
  )
}
