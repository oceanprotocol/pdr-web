import { walletClientToSigner } from '@/utils/walletClientToSigner'
import * as React from 'react'
import { useWalletClient } from 'wagmi'

export type TUseEthersSignerArgs = {
  chainId?: number
}

export function useEthersSigner({ chainId }: TUseEthersSignerArgs) {
  const { data: walletClient } = useWalletClient({ chainId })
  return React.useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  )
}
