import { useContractRead, useAccount } from 'wagmi'
import tokenABI from '../metadata/abis/tokenABI'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// TODO - Fix balance component so it stops throwing errors into the console
export default function Balance() {
    const {address} = useAccount()
    const [balance, setBalance] = useState('0')
    const { data } = useContractRead({
        address: '0xCfDdA22C9837aE76E0faA845354f33C62E03653a',
        abi: tokenABI,
        functionName: 'balanceOf',
        args:[address],
        chainId: 5
    })
    useEffect(() => {
      data && setBalance(ethers.utils.formatEther(BigInt(data as string).toString(10)))
  }, [data])
    return (
      <div>
        Balance: {balance} OCEAN
      </div>
    )
}
