import { currentConfig } from '@/utils/appconstants'
import { ethers } from 'ethers'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useContractRead } from 'wagmi'
import { IERC20ABI } from '../metadata/abis/IERC20ABI'

// Define the context type that will be used in the provider and consumer
type UserContextType = {
  balance: number
  userSignature: boolean
  isBuyingSubscription: string
  refetchBalance: () => void
  setUserSignature: (value: boolean) => void
  setIsBuyingSubscription: (value: string) => void
}

export type TUserContextProps = {
  children: React.ReactNode
}

// Create the initial context
const initialContextValue: UserContextType = {
  balance: 0,
  userSignature: false,
  isBuyingSubscription: '',
  refetchBalance: () => {},
  setUserSignature: (value: boolean) => {},
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
  const [userSignature, setUserSignature] = useState<boolean>(true)

  const { address } = useAccount()

  const { chainId, oceanTokenAddress } = currentConfig

  // Validate addresses before making contract read
  const isValidAddress =
    address &&
    address !== '0x0' &&
    address !== ethers.constants.AddressZero &&
    ethers.utils.isAddress(address)
  const isValidOceanTokenAddress =
    oceanTokenAddress &&
    oceanTokenAddress !== '0x0' &&
    oceanTokenAddress !== ethers.constants.AddressZero &&
    ethers.utils.isAddress(oceanTokenAddress)

  const balanceResponse = useContractRead({
    address: isValidOceanTokenAddress
      ? (oceanTokenAddress as `0x${string}`)
      : undefined,
    abi: IERC20ABI,
    functionName: 'balanceOf',
    args: isValidAddress ? [address as `0x${string}`] : undefined,
    chainId: parseInt(chainId),
    enabled: isValidAddress && isValidOceanTokenAddress, // Only enable if both addresses are valid
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
        userSignature,
        isBuyingSubscription,
        refetchBalance,
        setUserSignature,
        setIsBuyingSubscription
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
