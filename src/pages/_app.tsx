import { SocketProvider } from '@/contexts/SocketContext'
import { ganache, oasis } from '@/metadata/networksConfig'
import '@/styles/globals.css'
import { EthereumClient, w3mConnectors } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [oasis, ganache],
  [publicProvider()]
)

const projectId = 'YOUR_PROJECT_ID'

const wagmiConfig = createConfig({
  webSocketPublicClient,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <SocketProvider>
          <Component {...pageProps} />
        </SocketProvider>
      </WagmiConfig>
      <Web3Modal projectId={''} ethereumClient={ethereumClient} />
    </>
  )
}

export default App
