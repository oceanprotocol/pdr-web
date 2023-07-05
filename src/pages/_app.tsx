import { SocketProvider } from '@/contexts/SocketContext'
import { ganache, oasis } from '@/metadata/networksConfig'
import '@/styles/globals.css'
import { networkProvider } from '@/utils/networkProvider'
import { EthereumClient, w3mConnectors } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { WagmiConfig, createClient } from 'wagmi'

const projectId = process.env.NEXT_PUBLIC_WC2_PROJECT_ID || ''
const chains = [oasis, ganache]

const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  provider: networkProvider.getProvider()
})

const ethereumClient = new EthereumClient(wagmiClient, chains)

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {' '}
      <WagmiConfig client={wagmiClient}>
        <SocketProvider>
          <Component {...pageProps} />
        </SocketProvider>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}

export default App
