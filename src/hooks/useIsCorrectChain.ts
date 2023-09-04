import { currentConfig } from '@/utils/appconstants'
import { useEffect, useState } from 'react'
import { useNetwork } from 'wagmi'

type TUseIsCorrectChain = {
  isCorrectNetwork: boolean
  chain: ReturnType<typeof useNetwork>['chain']
}

export const useIsCorrectChain = (): TUseIsCorrectChain => {
  const { chainId } = currentConfig
  const { chain } = useNetwork()
  const [isCorrectNetwork, setIsCorrecttNetwork] = useState<boolean>(false)

  useEffect(() => {
    if (chain) {
      setIsCorrecttNetwork(parseInt(chainId) === chain.id)
    }
  }, [chain, chainId])

  return {
    isCorrectNetwork,
    chain
  }
}
