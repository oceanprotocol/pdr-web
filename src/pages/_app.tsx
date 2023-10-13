import { PredictoorsProvider } from '@/contexts/PredictoorsContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { UserProvider } from '@/contexts/UserContext'
import '@/styles/globals.css'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import { NotificationContainer } from 'react-notifications'
import { WagmiConfig } from 'wagmi'

import { NotConnectedWarning } from '@/components/NotConnectedWarning'
import { MarketPriceProvider } from '@/contexts/MarketPriceContext'
import { TimeFrameProvider } from '@/contexts/TimeFrameContext'
import { useEthereumClient } from '@/hooks/useEthereumClient'
import { EPredictoorContractInterval } from '@/utils/types/EPredictoorContractInterval'
import { useRouter } from 'next/router'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

// Check that PostHog is client-side (used to handle Next.js SSR)
if (
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_POSTHOG == 'enabled'
) {
  posthog.init(
    process.env.NEXT_PUBLIC_POSTHOG_KEY
      ? process.env.NEXT_PUBLIC_POSTHOG_KEY
      : '',
    {
      api_host: 'https://eu.posthog.com',
      // Enable debug mode in development
      loaded: (posthog) => {
        posthog.debug(false)
      },
      capture_pageview: true // Disable automatic pageview capture, as we capture manually
    }
  )
}

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  const { wagmiConfig, ethereumClient, w3mProjectId } = useEthereumClient()

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture('$pageview')
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  return (
    <>
      <PostHogProvider client={posthog}>
        <NotificationContainer />
        {wagmiConfig && ethereumClient && w3mProjectId ? (
          <>
            <WagmiConfig config={wagmiConfig}>
              <UserProvider>
                <TimeFrameProvider
                  defaultTimeFrameInterval={EPredictoorContractInterval.e_5M}
                >
                  <SocketProvider>
                    <PredictoorsProvider>
                      <MarketPriceProvider>
                        <Component {...pageProps} />
                      </MarketPriceProvider>
                    </PredictoorsProvider>
                  </SocketProvider>
                </TimeFrameProvider>
              </UserProvider>
            </WagmiConfig>
            <Web3Modal
              projectId={w3mProjectId}
              ethereumClient={ethereumClient}
            />
          </>
        ) : (
          <NotConnectedWarning />
        )}
      </PostHogProvider>
    </>
  )
}

export default App
