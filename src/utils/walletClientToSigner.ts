import { providers } from 'ethers'
import { WalletClient } from 'wagmi'

export const walletClientToSigner = (
  walletClient: WalletClient
): providers.JsonRpcSigner => {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}
