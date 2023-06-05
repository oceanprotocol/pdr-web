import { useUserContext } from '../contexts/UserContext'
import Input from '../elements/Input'

export default function AmountInput() {
  const { balance, amount, setAmount } = useUserContext()

  const isEnabled = () => {
    let enabled = balance > 0

    if (process.env.NEXT_PUBLIC_ENV === 'mock') {
      enabled = true
    }

    return enabled
  }

  return (
    <Input
      type="number"
      value={amount}
      onChange={
        setAmount
          ? (value: number) => {
              setAmount(value)
            }
          : undefined
      }
      disabled={isEnabled() === false}
      min={0}
      max={balance}
    />
  )
}
