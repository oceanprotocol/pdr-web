import { OPFProvider } from '@/contexts/OPFContext'
import '@/styles/globals.css'
import { EthereumClient, w3mConnectors } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { ethers } from 'ethers'
import type { AppProps } from 'next/app'
import { createClient, WagmiConfig } from 'wagmi'
import { arbitrum, goerli, mainnet } from 'wagmi/chains'

const chains = [arbitrum, mainnet, goerli]
const projectId = process.env.NEXT_PUBLIC_WC2_PROJECT_ID || ''
const predictoorRPC = process.env.NEXT_PUBLIC_PREDICTOOR_RPC || ''
const predictoorPK = process.env.NEXT_PUBLIC_PREDICTOOR_PK || ''

// wagmi public provider
// const { provider } = configureChains(chains, [w3mProvider({ projectId })])

// infura provider
const provider = new ethers.providers.InfuraProvider(
  'homestead',
  predictoorRPC
)

const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)
const predictoorWallet = new ethers.Wallet(predictoorPK, provider)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <OPFProvider provider={provider} wallet={predictoorWallet}>
          <Component {...pageProps} />
        </OPFProvider>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}
