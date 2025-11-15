import { providers } from 'ethers'
import type { WalletClient } from 'viem'

export const walletClientToSigner = (
  walletClient: WalletClient
): providers.JsonRpcSigner => {
  const { account, chain, transport } = walletClient
  
  if (!chain || !account) {
    throw new Error('WalletClient must have chain and account')
  }
  
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}
