import { ethers } from 'ethers'
import { Chain } from 'wagmi'
import networksData from '../metadata/networks.json'

type NetworkNames = 'barge' | 'staging' | 'mainnet'

type NetworkConfig = Record<NetworkNames, string>

// Define your network configuration mapping the env variable to the network URL
const networkConfig: NetworkConfig = {
  barge: process.env.NEXT_PUBLIC_DEV_GANACHE_HOST || 'http://localhost:8545',
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
    await this.provider.send('eth_accounts', [])
  }

  getProvider() {
    return this.provider
  }

  getNativeCurrencyInfo(): Chain['nativeCurrency'] {
    switch (this.provider.network.chainId) {
      case 8996:
        return {
          name: 'Ganache Token',
          symbol: 'GNTK',
          decimals: 18
        }
      case 23295:
        return {
          name: 'Oasis Network',
          symbol: 'ROSE',
          decimals: 18
        }
      default:
        return {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        }
    }
  }

  getChainInfo(): Chain {
    return {
      id: this.provider.network.chainId,
      name: this.provider.network.name,
      network: this.provider.network.name,
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
