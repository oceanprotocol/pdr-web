"use client"

import { currentConfig } from "@/utils/appconstants"
import { ethers } from "ethers"
import React, { createContext, useContext, useMemo, useState } from "react"
import { useAccount, useContractRead } from "wagmi"
import { IERC20ABI } from "../metadata/abis/IERC20ABI"

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

const initialContextValue: UserContextType = {
  balance: 0,
  userSignature: false,
  isBuyingSubscription: "",
  refetchBalance: () => {},
  setUserSignature: () => {},
  setIsBuyingSubscription: () => {},
}

const UserContext = createContext<UserContextType>(initialContextValue)

export const useUserContext = () => useContext(UserContext)

export const UserProvider: React.FC<TUserContextProps> = ({ children }) => {
  const [isBuyingSubscription, setIsBuyingSubscription] = useState("")
  const [userSignature, setUserSignature] = useState(true)

  const { address } = useAccount()
  const { chainId, oceanTokenAddress } = currentConfig

  const isValidAddress =
    !!address &&
    address !== "0x0" &&
    address !== ethers.constants.AddressZero &&
    ethers.utils.isAddress(address)

  const isValidOceanTokenAddress =
    !!oceanTokenAddress &&
    oceanTokenAddress !== "0x0" &&
    oceanTokenAddress !== ethers.constants.AddressZero &&
    ethers.utils.isAddress(oceanTokenAddress)

  const balanceResponse = useContractRead({
    ...(isValidOceanTokenAddress && isValidAddress
      ? {
          address: oceanTokenAddress as `0x${string}`,
          args: [address as `0x${string}`] as const,
        }
      : {}),
    abi: IERC20ABI,
    functionName: "balanceOf",
    chainId: parseInt(chainId, 10),
    query: {
      enabled: isValidAddress && isValidOceanTokenAddress,
    },
  })

  const balance = useMemo(() => {
    if (!address || !balanceResponse.data) return 0

    const raw = balanceResponse.data as bigint | number | string
    const asBigInt =
      typeof raw === "bigint" ? raw : BigInt(raw.toString())

    return parseInt(ethers.utils.formatEther(asBigInt.toString()), 10)
  }, [address, balanceResponse.data])

  const refetchBalance = () => {
    void balanceResponse.refetch()
  }

  return (
    <UserContext.Provider
      value={{
        balance,
        userSignature,
        isBuyingSubscription,
        refetchBalance,
        setUserSignature,
        setIsBuyingSubscription,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
