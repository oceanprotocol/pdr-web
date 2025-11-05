import { ethers } from 'ethers'
import type { Chain } from 'wagmi/chains'
import networksData from '../metadata/networks.json'
import { Maybe } from './utils'

type NetworkNames =
  | 'barge'
  | 'development'
  | 'staging'
  | 'mainnet'
  | 'production'

type NetworkConfig = Record<NetworkNames, string>

// Define your network configuration mapping the env variable to the network URL
const networkConfig: NetworkConfig = {
  barge: process.env.NEXT_PUBLIC_DEV_GANACHE_HOST || 'http://localhost:8545',
  development: 'https://development.oceandao.org',
  staging: 'https://testnet.sapphire.oasis.dev',
  production: 'https://sapphire.oasis.io',
  mainnet: ''
}

class NetworkProvider {
  provider: ethers.providers.JsonRpcProvider

  constructor() {
    const env = process.env.NEXT_PUBLIC_ENV || 'barge'

    const networkURL =
      networkConfig[env as NetworkNames] || networkConfig['barge']

    this.provider = new ethers.providers.JsonRpcProvider(networkURL)
  }

  async init() {
    try {
      // Try to get network info without waiting for full network detection
      await this.provider.send('eth_accounts', [])
      
      // Wait for network promise with timeout
      try {
        await Promise.race([
          this.provider._networkPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Network detection timeout')), 5000)
          )
        ])
      } catch (networkError) {
        // If network detection fails, try to get network explicitly
        try {
          await this.provider.getNetwork()
        } catch (getNetworkError) {
          console.warn('Network detection failed, but continuing with RPC URL:', getNetworkError)
          // Continue anyway - we can still use the RPC URL
        }
      }
    } catch (e) {
      console.warn('Network Provider initialization warning:', e)
      // Don't throw - allow the app to continue
    }
  }

  getProvider() {
    return this.provider
  }

  getNativeCurrencyInfo(): Chain['nativeCurrency'] {
    const defaultDecimals = 18
    switch (this.provider.network?.chainId) {
      case 8996:
        return {
          name: 'Ganache Token',
          symbol: 'GNTK',
          decimals: defaultDecimals
        }
      case 23295:
        return {
          name: 'Oasis Network',
          symbol: 'ROSE',
          decimals: defaultDecimals
        }
      case 23294:
        return {
          name: 'Oasis Network',
          symbol: 'ROSE',
          decimals: defaultDecimals
        }
      default:
        return {
          name: 'Ether',
          symbol: 'ETH',
          decimals: defaultDecimals
        }
    }
  }

  getChainName(): string {
    if (this.provider.network?.name !== 'unknown')
      return this.provider.network?.name

    if (this.provider.network?.chainId === 23295)
      return 'Oasis Sapphire Testnet'

    if (this.provider.network?.chainId === 23294) return 'Oasis Sapphire'

    return `Chain ${this.provider.network?.chainId}`
  }

  getChainInfo(): Maybe<Chain> {
    if (!this.provider.network) return null

    const chainId = this.provider.network.chainId
    const rpcUrl = this.provider.connection.url

    // Configure block explorers based on chain ID
    let blockExplorers: Chain['blockExplorers'] = undefined
    if (chainId === 23295) {
      // Oasis Sapphire Testnet
      blockExplorers = {
        default: {
          name: 'Oasis Sapphire Testnet Explorer',
          url: 'https://testnet.explorer.sapphire.oasis.dev'
        }
      }
    } else if (chainId === 23294) {
      // Oasis Sapphire Mainnet
      blockExplorers = {
        default: {
          name: 'Oasis Sapphire Explorer',
          url: 'https://explorer.sapphire.oasis.io'
        }
      }
    }

    return {
      id: chainId,
      name: this.getChainName(),
      nativeCurrency: this.getNativeCurrencyInfo(),
      rpcUrls: {
        public: { http: [rpcUrl] },
        default: { http: [rpcUrl] }
      },
      blockExplorers
    } as Chain
  }

  getNetworkName(chainId: number): string | undefined {
    return networksData.find((data) => data.chainId == chainId)?.name
  }

  getSigner(address: string) {
    return this.provider.getSigner(address)
  }
}

const networkProvider = new NetworkProvider()

export { networkProvider }
