import '@/styles/globals.css'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import { NotificationContainer } from 'react-notifications'

import MainWrapper from '@/components/MainWrapper'
import { NotConnectedWarning } from '@/components/NotConnectedWarning'
import AppProvider from '@/contexts/AppProvider'
import {
  EEthereumClientStatus,
  useEthereumClient
} from '@/hooks/useEthereumClient'
import { useRouter } from 'next/router'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect, useMemo } from 'react'

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

  const { wagmiConfig, ethereumClient, w3mProjectId, clientStatus } =
    useEthereumClient()

  const configsStatus = wagmiConfig && ethereumClient && w3mProjectId

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture('$pageview')
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  const isHome = useMemo(() => router.pathname === '/', [router.pathname])
  return (
    <div className={inter.className}>
      <PostHogProvider client={posthog}>
        <NotificationContainer />
        {configsStatus &&
          clientStatus !== EEthereumClientStatus.DISCONNECTED && (
            <>
              <AppProvider wagmiConfig={wagmiConfig}>
                <MainWrapper>
                  <Component {...pageProps} />
                </MainWrapper>
              </AppProvider>

              <Web3Modal
                projectId={w3mProjectId}
                ethereumClient={ethereumClient}
              />
            </>
          )}
        {clientStatus === EEthereumClientStatus.DISCONNECTED && (
          <MainWrapper withBanner={false} isWalletActive={false}>
            {isHome ? (
              <NotConnectedWarning clientStatus={clientStatus} />
            ) : (
              <Component {...pageProps} />
            )}
          </MainWrapper>
        )}
      </PostHogProvider>
    </div>
  )
}

export default App
