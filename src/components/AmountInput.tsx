import { useUserContext } from '../contexts/UserContext'
import Input from './Input'

export default function AmountInput() {
  const { balance, amount, setAmount } = useUserContext()
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
      disabled={balance == 0}
      min={0}
      max={balance}
    />
  )
}
