import { currentConfig } from '@/utils/appconstants'
import { ethers } from 'ethers'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useContractRead } from 'wagmi'
import { IERC20ABI } from '../metadata/abis/IERC20ABI'

// Define the context type that will be used in the provider and consumer
type UserContextType = {
  balance: number
  refetchBalance: () => void
}

export type TUserContextProps = {
  children: React.ReactNode
}

// Create the initial context
const initialContextValue: UserContextType = {
  balance: 0,
  refetchBalance: () => {}
}

// Create the context
const UserContext = createContext<UserContextType>(initialContextValue)

export const useUserContext = () => {
  return useContext(UserContext)
}

export const UserProvider: React.FC<TUserContextProps> = ({ children }) => {
  // Define the state to store the user data
  const [balance, setBalance] = useState<number>(0)

  const { address } = useAccount()
  const { chainId, oceanTokenAddress } = currentConfig
  const { data, refetch } = useContractRead({
    address: oceanTokenAddress,
    abi: IERC20ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: parseInt(chainId)
  })
  useEffect(() => {
    data &&
      setBalance(
        parseInt(ethers.utils.formatEther(BigInt(data.toString()).toString(10)))
      )
  }, [data])

  const refetchBalance = () => {
    refetch().then((result: any) => {
      setBalance(
        !address
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
  }, [address])

  // Provide the state using the UserContext.Provider
  return (
    <UserContext.Provider value={{ balance, refetchBalance }}>
      {children}
    </UserContext.Provider>
  )
}
