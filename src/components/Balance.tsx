import { currentConfig } from '@/utils/appconstants'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount, useContractRead } from 'wagmi'
import { IERC20ABI } from '../metadata/abis/IERC20ABI'
import styles from '../styles/Balance.module.css'

export default function Balance() {
  const { address } = useAccount()
  const [balance, setBalance] = useState('0')
  const { chainId } = currentConfig
  const { data, refetch } = useContractRead({
    address: '0x5b43cf84a63925201da55ea0048f76bd70bb6be5',
    abi: IERC20ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: parseInt(chainId)
  })
  useEffect(() => {
    data &&
      setBalance(ethers.utils.formatEther(BigInt(data.toString()).toString(10)))
  }, [data])

  useEffect(() => {
    refetch().then((result: any) => {
      setBalance(
        !address
          ? '0'
          : ethers.utils.formatEther(
              BigInt(result.data.toString()).toString(10)
            )
      )
    })
  }, [address])
  return (
    <div className={styles.container}>
      <span className={styles.component}>Balance</span>
      <span className={styles.component}> {balance} OCEAN</span>
    </div>
  )
}
