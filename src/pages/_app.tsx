import { LocalEpochProvider } from '@/contexts/LocalEpochContext'
import { OPFProvider } from '@/contexts/OPFContext'
import { UserProvider } from '@/contexts/UserContext'
import { oasis } from '@/metadata/networksConfig'
import '@/styles/globals.css'
import { EthereumClient, w3mConnectors } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { ethers } from 'ethers'
import type { AppProps } from 'next/app'
import { WagmiConfig, configureChains, createClient } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

const chains = [oasis]
const projectId = process.env.NEXT_PUBLIC_WC2_PROJECT_ID || ''
const predictoorRPC = process.env.NEXT_PUBLIC_PREDICTOOR_RPC || ''
const predictoorPK = process.env.NEXT_PUBLIC_PREDICTOOR_PK || ''

// wagmi public provider
const { provider } = configureChains(chains, [publicProvider()])

// infura provider
// TODO - We cannoot assume user wants to connect w/ mainnet
// Please see utils/network.ts
const infuraProviderETH = new ethers.providers.InfuraProvider(
  'homestead',
  predictoorRPC
)

const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)
const predictoorWallet = new ethers.Wallet(predictoorPK, infuraProviderETH)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <OPFProvider provider={infuraProviderETH} wallet={predictoorWallet}>
          <UserProvider>
            <LocalEpochProvider>
              <Component {...pageProps} />
            </LocalEpochProvider>
          </UserProvider>
        </OPFProvider>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}
