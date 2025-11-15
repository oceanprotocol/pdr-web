import { currentConfig } from '@/utils/appconstants'
import { useAccount, useChainId, useConfig } from 'wagmi'
import type { Chain } from 'viem'

type TUseIsCorrectChain = {
  isCorrectNetwork: boolean
  chain: Chain | undefined
}

export const useIsCorrectChain = (): TUseIsCorrectChain => {
  const { chainId } = currentConfig
  const chainIdFromHook = useChainId()
  const { chainId: chainIdFromAccount } = useAccount()
  const config = useConfig()

  const chainIdNum = chainIdFromAccount ?? chainIdFromHook

  const chain = config.chains?.find((c: Chain) => c.id === chainIdNum)

  const isCorrectNetwork =
    chainIdNum ? parseInt(chainId) === chainIdNum : false

  return { isCorrectNetwork, chain }
}
