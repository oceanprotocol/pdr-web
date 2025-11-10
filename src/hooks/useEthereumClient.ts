import { networkProvider } from '@/utils/networkProvider'
import { Maybe } from '@/utils/utils'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  argentWallet,
  backpackWallet,
  binanceWallet,
  bitgetWallet,
  braveWallet,
  coin98Wallet,
  coreWallet,
  enkryptWallet,
  frameWallet,
  frontierWallet,
  imTokenWallet,
  ledgerWallet,
  metaMaskWallet,
  mewWallet,
  okxWallet,
  omniWallet,
  oneInchWallet,
  oneKeyWallet,
  phantomWallet,
  rabbyWallet,
  safeWallet,
  safepalWallet,
  tahoWallet,
  talismanWallet,
  tokenPocketWallet,
  trustWallet,
  xdefiWallet,
  zerionWallet
} from '@rainbow-me/rainbowkit/wallets'
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

        // Get network info - networkProvider.init() should have set it
        const provider = networkProvider.getProvider()
        let network = provider.network

        // If network is still not set, try to get it with error handling
        if (!network) {
          try {
            // Try to get network, but don't fail if it doesn't work
            network = (await Promise.race([
              provider.getNetwork(),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error('Network detection timeout')),
                  2000
                )
              )
            ])) as any
          } catch (networkError) {
            // Network detection failed - this is OK, we'll use chainInfo from env
            console.warn(
              'Network auto-detection failed, using configured chain info:',
              networkError
            )
          }
        }

        // Get chain info - this should work even if network detection failed
        let chainInfo = networkProvider.getChainInfo()

        // If chainInfo is null, try to create it from environment
        if (!chainInfo) {
          const env = process.env.NEXT_PUBLIC_ENV || 'barge'
          let fallbackChainId: number
          let fallbackRpcUrl: string

          switch (env) {
            case 'production':
              fallbackChainId = 23294
              fallbackRpcUrl = 'https://sapphire.oasis.io'
              break
            case 'staging':
              fallbackChainId = 23295
              fallbackRpcUrl = 'https://testnet.sapphire.oasis.dev'
              break
            case 'barge':
            case 'development':
            default:
              fallbackChainId = 8996
              fallbackRpcUrl =
                process.env.NEXT_PUBLIC_DEV_GANACHE_HOST ||
                'http://localhost:8545'
          }

          // Create fallback chain info
          chainInfo = {
            id: fallbackChainId,
            name:
              env === 'production'
                ? 'Oasis Sapphire'
                : env === 'staging'
                ? 'Oasis Sapphire Testnet'
                : 'Ganache',
            nativeCurrency: {
              name: 'Oasis Network',
              symbol: 'ROSE',
              decimals: 18
            },
            rpcUrls: {
              default: { http: [fallbackRpcUrl] },
              public: { http: [fallbackRpcUrl] }
            }
          } as Chain
        }

        // Set chains with the chain info (either detected or fallback)
        setChains([chainInfo])

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
          // chainInfo is guaranteed to be non-null at this point due to fallback logic above
          return (
            chain.id === chainInfo!.id ||
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
          // Get the current origin for proper deep link generation on mobile
          // Ensure URL is properly formatted to avoid Safari "invalid address" errors
          let appUrl: string | undefined
          if (typeof window !== 'undefined') {
            try {
              // Use the full URL including protocol to ensure proper deep link generation
              appUrl = window.location.origin
              // Ensure the URL doesn't have trailing slashes or special characters that could break deep links
              appUrl = appUrl.replace(/\/+$/, '')
            } catch (e) {
              console.warn('Failed to get app URL for deep links:', e)
            }
          }

          // Build wallet list from scratch - DO NOT use getDefaultWallets
          // We include only the wallets we explicitly want
          // MetaMask is included but won't auto-connect since we're not using getDefaultWallets
          const walletList = [
            {
              groupName: 'Popular',
              wallets: [
                () => metaMaskWallet({ projectId }),
                () => tahoWallet() // Put Taho as second option
              ]
            },
            {
              groupName: 'DeFi Wallets',
              wallets: [
                () => rabbyWallet(),
                () => zerionWallet({ projectId }),
                () => oneInchWallet({ projectId }),
                () => argentWallet({ projectId }),
                () => xdefiWallet()
              ]
            },
            {
              groupName: 'Hardware Wallets',
              wallets: [() => ledgerWallet({ projectId }), () => oneKeyWallet()]
            },
            {
              groupName: 'Browser Wallets',
              wallets: [
                () => braveWallet(),
                () => frameWallet(),
                () => coreWallet({ projectId }),
                () => enkryptWallet(),
                () => frontierWallet({ projectId }),
                () => talismanWallet()
              ]
            },
            {
              groupName: 'Mobile Wallets',
              wallets: [
                () => trustWallet({ projectId }),
                () => imTokenWallet({ projectId }),
                () => omniWallet({ projectId }),
                () => okxWallet({ projectId }),
                () => tokenPocketWallet({ projectId }),
                () => safepalWallet({ projectId }),
                () => coin98Wallet({ projectId })
              ]
            },
            {
              groupName: 'Exchange Wallets',
              wallets: [
                () => binanceWallet({ projectId }),
                () => bitgetWallet({ projectId })
              ]
            },
            {
              groupName: 'Other Wallets',
              wallets: [
                () => mewWallet({ projectId }),
                () => safeWallet(),
                () => phantomWallet(),
                () => backpackWallet()
              ]
            }
          ]

          // Use getDefaultConfig with our custom wallet list (NO MetaMask)
          // This prevents any auto-connection to MetaMask
          const config = getDefaultConfig({
            appName: 'Predictoor',
            projectId,
            chains: supportedChains as [Chain, ...Chain[]],
            transports,
            ssr: false,
            appUrl,
            appDescription: 'Predictoor - Decentralized Prediction Markets',
            appIcon: appUrl ? `${appUrl}/favicon.ico` : undefined,
            wallets: walletList as any
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
