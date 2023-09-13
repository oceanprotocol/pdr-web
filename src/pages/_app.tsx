import { PredictoorsProvider } from '@/contexts/PredictoorsContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { UserProvider } from '@/contexts/UserContext'
import '@/styles/globals.css'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { NotificationContainer } from 'react-notifications'
import { WagmiConfig } from 'wagmi'

import { useEthereumClient } from '@/hooks/useEthereumClient'
import { useRouter } from 'next/router'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== 'undefined') {
  posthog.init(
    process.env.NEXT_PUBLIC_POSTHOG_KEY
      ? process.env.NEXT_PUBLIC_POSTHOG_KEY
      : '',
    {
      api_host: 'https://eu.posthog.com',
      // Enable debug mode in development
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
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
        {wagmiConfig && ethereumClient && w3mProjectId && (
          <>
            <WagmiConfig config={wagmiConfig}>
              <UserProvider>
                <SocketProvider>
                  <PredictoorsProvider>
                    <Component {...pageProps} />
                  </PredictoorsProvider>
                </SocketProvider>
              </UserProvider>
            </WagmiConfig>
            <Web3Modal
              projectId={w3mProjectId}
              ethereumClient={ethereumClient}
            />
          </>
        )}
      </PostHogProvider>
    </>
  )
}

export default App
