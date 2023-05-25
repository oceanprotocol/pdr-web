import { getAssetBalance } from '@/utils/kraken'
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState
} from 'react'
import { useAccount } from 'wagmi'

type UserType = {
  balance: number
  amount: number // I'm not sure why amount is needed here? Isn't the only place needed within the row component?
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

  /*const currentConfig = process.env.NEXT_PUBLIC_ENV
    ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
    : config['staging']

  const { data } = useContractRead({
    address: currentConfig.oceanAddress as `0x{string}`,
    abi: tokenABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: parseInt(currentConfig.chainId)
  })*/

  useEffect(() => {
    getAssetBalance(
      process.env.NEXT_PUBLIC_EXCHANGE_KEY || '',
      process.env.NEXT_PUBLIC_PRIVATE_EXCHANGE_KEY || ''
    ).then((resp) => {
      setBalance(resp?.result['USDC'] ? resp?.result['USDC'] : 0)
      console.log(resp)
    })
  }, [])

  /*useEffect(() => {
    data &&
      setBalance(
        parseInt(ethers.utils.formatEther(BigInt(data as string).toString(10)))
      )
  }, [data])*/

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
