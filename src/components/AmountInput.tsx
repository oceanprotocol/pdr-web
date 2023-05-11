import { useState } from 'react'
import { useUserContext } from '../contexts/UserContext'
import Input from './Input'

export default function AmountInput() {
  const [amount, setAmount] = useState<Number>(0)
  const { balance } = useUserContext()
  return (
    <Input
      type="number"
      value={amount}
      onChange={(value: number) => {
        setAmount(value)
      }}
      disabled={balance == 0}
      min={0}
      max={balance}
    />
  )
}
