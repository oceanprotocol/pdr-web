import { SocketProvider } from '@/contexts/SocketContext'
import { SubscribedPredictoorsProvider } from '@/contexts/SubscribedPredictoorsContext'
import '@/styles/globals.css'
import { ethereumClient, w3mProjectId, wagmiConfig } from '@/utils/web3Clients'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { WagmiConfig } from 'wagmi'

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <SocketProvider>
          <SubscribedPredictoorsProvider>
            <Component {...pageProps} />
          </SubscribedPredictoorsProvider>
        </SocketProvider>
      </WagmiConfig>
      <Web3Modal projectId={w3mProjectId} ethereumClient={ethereumClient} />
    </>
  )
}

export default App
