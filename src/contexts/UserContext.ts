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
import config from '../metadata/config.json'

type UserType = {
  balance: number
  amount: number // I'm not sure why amount is needed here? Isn't the only place needed within the row component?
  krakenPrivateKey: string | undefined
  setAmount?: (value: number) => void
  setKrakenPrivateKey?: (value: string | undefined) => void
}

export const UserContext = createContext<UserType>({
  balance: 0,
  amount: 0,
  krakenPrivateKey: undefined,
  setAmount: undefined,
  setKrakenPrivateKey: undefined
})

type UserProps = {
  children: React.ReactNode
}

export const UserProvider = ({ children }: UserProps) => {
  const { address } = useAccount()
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState<number>(0)
  const [krakenPrivateKey, setKrakenPrivateKey] = useState<string>()

  const currentConfig = process.env.NEXT_PUBLIC_ENV
    ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
    : config['staging']

  const { data } = useContractRead({
    address: currentConfig.oceanAddress as `0x{string}`,
    abi: tokenABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: parseInt(currentConfig.chainId)
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
    {
      value: {
        balance,
        amount,
        krakenPrivateKey,
        setAmount,
        setKrakenPrivateKey
      }
    },
    children
  )
}

export const useUserContext = () => useContext(UserContext)
