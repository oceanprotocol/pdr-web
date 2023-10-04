import { currentConfig } from '@/utils/appconstants'
import { ethers } from 'ethers'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useContractRead } from 'wagmi'
import { IERC20ABI } from '../metadata/abis/IERC20ABI'

// Define the context type that will be used in the provider and consumer
type UserContextType = {
  balance: number
  isBuyingSubscription: string
  refetchBalance: () => void
  setIsBuyingSubscription: (value: string) => void
}

export type TUserContextProps = {
  children: React.ReactNode
}

// Create the initial context
const initialContextValue: UserContextType = {
  balance: 0,
  isBuyingSubscription: '',
  refetchBalance: () => {},
  setIsBuyingSubscription: (value: string) => {}
}

// Create the context
const UserContext = createContext<UserContextType>(initialContextValue)

export const useUserContext = () => {
  return useContext(UserContext)
}

export const UserProvider: React.FC<TUserContextProps> = ({ children }) => {
  // Define the state to store the user data
  const [balance, setBalance] = useState<number>(0)
  const [isBuyingSubscription, setIsBuyingSubscription] = useState<string>('')

  const { address } = useAccount()

  const { chainId, oceanTokenAddress } = currentConfig
  const balanceResponse = useContractRead({
    address: oceanTokenAddress,
    abi: IERC20ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: parseInt(chainId),
    onError(error) {
      console.log('Error', error)
    }
  })

  useEffect(() => {
    balanceResponse.data &&
      setBalance(
        parseInt(
          ethers.utils.formatEther(
            BigInt(balanceResponse.data.toString()).toString(10)
          )
        )
      )
  }, [balanceResponse.data])

  const refetchBalance = () => {
    balanceResponse.refetch().then((result: any) => {
      setBalance(
        !address || !result.data
          ? 0
          : parseInt(
              ethers.utils.formatEther(
                BigInt(result.data.toString()).toString(10)
              )
            )
      )
    })
  }

  useEffect(() => {
    refetchBalance()
  }, [])

  // Provide the state using the UserContext.Provider
  return (
    <UserContext.Provider
      value={{
        balance,
        isBuyingSubscription,
        refetchBalance,
        setIsBuyingSubscription
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
