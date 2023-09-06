import { PredictionHistoryProvider } from '@/contexts/PredictionHistoryContext'
import { PredictoorsProvider } from '@/contexts/PredictoorsContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { UserProvider } from '@/contexts/UserContext'
import '@/styles/globals.css'
import { ethereumClient, w3mProjectId, wagmiConfig } from '@/utils/web3Clients'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { NotificationContainer } from 'react-notifications'
import { WagmiConfig } from 'wagmi'

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NotificationContainer />
      <WagmiConfig config={wagmiConfig}>
        <UserProvider>
          <SocketProvider>
            <PredictionHistoryProvider>
              <PredictoorsProvider>
                <Component {...pageProps} />
              </PredictoorsProvider>
            </PredictionHistoryProvider>
          </SocketProvider>
        </UserProvider>
      </WagmiConfig>
      <Web3Modal projectId={w3mProjectId} ethereumClient={ethereumClient} />
    </>
  )
}

export default App
