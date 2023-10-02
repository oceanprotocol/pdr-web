import { ethers } from 'ethers'
import { Chain } from 'wagmi'
import networksData from '../metadata/networks.json'
import { Maybe } from './utils'

type NetworkNames = 'barge' | 'development' | 'staging' | 'mainnet'

type NetworkConfig = Record<NetworkNames, string>

// Define your network configuration mapping the env variable to the network URL
const networkConfig: NetworkConfig = {
  barge: process.env.NEXT_PUBLIC_DEV_GANACHE_HOST || 'http://localhost:8545',
  development: 'https://development.oceandao.org',
  staging: 'https://testnet.sapphire.oasis.dev',
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
      const resp = await this.provider.send('eth_accounts', [])
    } catch (e) {
      console.log('Network Provider cannot be initialized', e)
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

    return `Chain ${this.provider.network?.chainId}`
  }

  async getChainInfo(): Promise<Maybe<Chain>> {
    await this.provider._networkPromise
    if (!this.provider.network) return null

    return {
      id: this.provider.network?.chainId,
      name: this.getChainName(),
      network: this.getChainName(),
      nativeCurrency: this.getNativeCurrencyInfo(),
      rpcUrls: {
        public: { http: [this.provider.connection.url] },
        default: { http: [this.provider.connection.url] }
      }
    }
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
