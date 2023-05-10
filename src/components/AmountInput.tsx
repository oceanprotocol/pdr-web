import { useState } from 'react'
import Input from './Input'

export default function AmountInput() {
  const [amount, setAmount] = useState<Number>(0)
  return (
    <Input
      type="number"
      value={amount}
      onChange={(value: number) => {
        setAmount(value)
      }}
      min={0}
    />
  )
}
