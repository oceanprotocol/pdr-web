import { networkProvider } from '@/utils/networkProvider'
import { Maybe } from '@/utils/utils'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { http } from 'viem'
import type { Chain } from 'wagmi/chains'

export enum EEthereumClientStatus {
  'LOADING',
  'CONNECTED',
  'DISCONNECTED'
}

type TWagmiConfig = ReturnType<typeof getDefaultConfig>

function useEthereumClient() {
  const [wagmiConfig, setWagmiConfig] = useState<Maybe<TWagmiConfig>>(null)
  const [chains, setChains] = useState<Chain[]>([])
  const [status, setStatus] = useState<EEthereumClientStatus>(
    EEthereumClientStatus.LOADING
  )

  useEffect(() => {
    // Ensure we're in the browser environment before initializing
    if (typeof window === 'undefined') {
      return
    }

    async function initializeEthereumClient() {
      try {
        await networkProvider.init()

        // Get network info - try multiple approaches
        const provider = networkProvider.getProvider()
        let network = provider.network

        // If network is not set, try to get it
        if (!network) {
          try {
            // Wait for network promise if available
            if (provider._networkPromise) {
              try {
                await Promise.race([
                  provider._networkPromise,
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 3000)
                  )
                ])
                network = provider.network
              } catch (timeoutError) {
                // Continue without waiting
              }
            }

            // If still no network, try explicit call
            if (!network) {
              try {
                network = await provider.getNetwork()
              } catch (getNetworkError) {
                // If this fails, we'll use the RPC URL directly
                console.warn(
                  'Could not auto-detect network, using configured RPC URL'
                )
              }
            }
          } catch (networkError) {
            console.warn(
              'Network detection issue, continuing with RPC URL:',
              networkError
            )
          }
        }

        const chainInfo = networkProvider.getChainInfo()

        if (!chainInfo) {
          setStatus(EEthereumClientStatus.DISCONNECTED)
          return
        }

        // Get RPC URL from chain info
        const rpcUrl = chainInfo.rpcUrls.default.http[0]

        if (!rpcUrl) {
          console.error('RPC URL not found for chain')
          setStatus(EEthereumClientStatus.DISCONNECTED)
          return
        }

        // Configure RainbowKit with wagmi v2 using getDefaultConfig
        const projectId = process.env.NEXT_PUBLIC_WC2_PROJECT_ID as string

        if (!projectId) {
          console.error(
            'WalletConnect Project ID is missing. Please set NEXT_PUBLIC_WC2_PROJECT_ID'
          )
          setStatus(EEthereumClientStatus.DISCONNECTED)
          return
        }

        // Create ALL supported chains for the app (not just the current one)
        // This allows wagmi to detect network switches to any supported chain
        const supportedChains: Chain[] = [
          // Oasis Sapphire Mainnet (production)
          {
            id: 23294,
            name: 'Oasis Sapphire',
            network: 'sapphire',
            nativeCurrency: {
              name: 'Oasis Network',
              symbol: 'ROSE',
              decimals: 18
            },
            rpcUrls: {
              default: { http: ['https://sapphire.oasis.io'] },
              public: { http: ['https://sapphire.oasis.io'] }
            },
            blockExplorers: {
              default: {
                name: 'Oasis Sapphire Explorer',
                url: 'https://explorer.sapphire.oasis.io'
              }
            }
          } as Chain,
          // Oasis Sapphire Testnet (staging)
          {
            id: 23295,
            name: 'Oasis Sapphire Testnet',
            network: 'sapphire-testnet',
            nativeCurrency: {
              name: 'Oasis Network',
              symbol: 'ROSE',
              decimals: 18
            },
            rpcUrls: {
              default: { http: ['https://testnet.sapphire.oasis.dev'] },
              public: { http: ['https://testnet.sapphire.oasis.dev'] }
            },
            blockExplorers: {
              default: {
                name: 'Oasis Sapphire Testnet Explorer',
                url: 'https://testnet.explorer.sapphire.oasis.dev'
              }
            }
          } as Chain,
          // Development/Ganache (if configured)
          {
            id: 8996,
            name: 'Ganache',
            network: 'ganache',
            nativeCurrency: {
              name: 'Ganache Token',
              symbol: 'GNTK',
              decimals: 18
            },
            rpcUrls: {
              default: {
                http: [
                  process.env.NEXT_PUBLIC_DEV_GANACHE_HOST ||
                    'http://localhost:8545'
                ]
              },
              public: {
                http: [
                  process.env.NEXT_PUBLIC_DEV_GANACHE_HOST ||
                    'http://localhost:8545'
                ]
              }
            }
          } as Chain
        ].filter((chain) => {
          // Include current chain and other supported chains
          return (
            chain.id === chainInfo.id ||
            chain.id === 23294 ||
            chain.id === 23295
          )
        }) as Chain[]

        setChains(supportedChains)

        // Create transports object for all chains
        const transports = supportedChains.reduce((acc, chain) => {
          const chainRpcUrl = chain.rpcUrls.default.http[0]
          if (chainRpcUrl) {
            acc[chain.id] = http(chainRpcUrl)
          }
          return acc
        }, {} as Record<number, ReturnType<typeof http>>)

        try {
          // Create config with ALL supported chains - this allows wagmi to detect network switches
          const config = getDefaultConfig({
            appName: 'Predictoor',
            projectId,
            chains: supportedChains as [Chain, ...Chain[]],
            transports,
            ssr: false
          }) as TWagmiConfig

          setWagmiConfig(config)
          setStatus(EEthereumClientStatus.CONNECTED)

          // Log when config is ready
          console.log(
            'Wagmi config initialized with chains:',
            supportedChains.map((c) => `${c.name} (${c.id})`).join(', ')
          )
        } catch (configError) {
          console.error('Error creating RainbowKit config:', configError)
          setStatus(EEthereumClientStatus.DISCONNECTED)
        }
      } catch (error) {
        console.error('Failed to initialize Ethereum client:', error)
        setStatus(EEthereumClientStatus.DISCONNECTED)
      }
    }

    initializeEthereumClient()
  }, [])

  return { wagmiConfig, chains, clientStatus: status }
}

export { useEthereumClient }
