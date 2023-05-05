import { useContractRead, useAccount } from 'wagmi'
import tokenABI from '../metadata/abis/tokenABI'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

export default function Balance() {
  const { address } = useAccount()
  const [balance, setBalance] = useState('0')
  const { data } = useContractRead({
    address: '0xCfDdA22C9837aE76E0faA845354f33C62E03653a',
    abi: tokenABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: 5
  })
  useEffect(() => {
    data &&
      setBalance(ethers.utils.formatEther(BigInt(data.toString()).toString(10)))
  }, [data])
  return <div>Balance: {balance} OCEAN</div>
}
