import { ethers } from 'ethers'
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState
} from 'react'
import { useAccount, useContractRead } from 'wagmi'
import { tokenABI } from '../metadata/abis/tokenABI'

type UserType = {
  balance: number
  amount: number
  setAmount?: (value: number) => void
}

export const UserContext = createContext<UserType>({
  balance: 0,
  amount: 0,
  setAmount: undefined
})

type UserProps = {
  children: React.ReactNode
}

export const UserProvider = ({ children }: UserProps) => {
  const { address } = useAccount()
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState<number>(0)

  const { data } = useContractRead({
    address: '0xCfDdA22C9837aE76E0faA845354f33C62E03653a',
    abi: tokenABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: 5
  })

  useEffect(() => {
    data &&
      setBalance(
        parseInt(ethers.utils.formatEther(BigInt(data as string).toString(10)))
      )
  }, [data])

  useEffect(() => {
    !address && setBalance(0)
  }, [address])

  return createElement(
    UserContext.Provider,
    { value: { balance, amount, setAmount } },
    children
  )
}

export const useUserContext = () => useContext(UserContext)
