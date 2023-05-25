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
  krakenApiKey: string | undefined
  setAmount?: (value: number) => void
  krakenSecretKey: string | undefined
  setKrakenSecretKey?: (value: string | undefined) => void
  setKrakenApiKey?: (value: string | undefined) => void
}

export const UserContext = createContext<UserType>({
  balance: 0,
  amount: 0,
  krakenApiKey: undefined,
  krakenSecretKey: undefined,
  setAmount: undefined,
  setKrakenApiKey: undefined,
  setKrakenSecretKey: undefined
})

type UserProps = {
  children: React.ReactNode
}

export const UserProvider = ({ children }: UserProps) => {
  const { address } = useAccount()
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState<number>(0)
  const [krakenApiKey, setKrakenApiKey] = useState<string>()
  const [krakenSecretKey, setKrakenSecretKey] = useState<string>()

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
      process.env.NEXT_PUBLIC_EXCHANGE_KEY || krakenApiKey,
      process.env.NEXT_PUBLIC_PRIVATE_EXCHANGE_KEY || krakenSecretKey
    ).then((resp) => {
      setBalance(resp?.result['USDC'] ? resp?.result['USDC'] : 0)
      console.log(resp)
    })
  }, [krakenApiKey, krakenSecretKey])

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
    {
      value: {
        balance,
        amount,
        krakenApiKey,
        krakenSecretKey,
        setAmount,
        setKrakenApiKey,
        setKrakenSecretKey
      }
    },
    children
  )
}

export const useUserContext = () => useContext(UserContext)
