import { ethers } from 'ethers'
import networksData from '../metadata/networks.json'

type NetworkNames = 'development' | 'mock' | 'testnet' | 'mainnet'

type NetworkConfig = Record<NetworkNames, string>

// Define your network configuration mapping the env variable to the network URL
const networkConfig: NetworkConfig = {
  development: 'http://localhost:8545',
  mock: 'http://localhost:8545',
  testnet: '',
  mainnet: ''
}

class NetworkProvider {
  provider: ethers.providers.JsonRpcProvider

  constructor() {
    const env = process.env.ENVIRONMENT || 'development'
    const networkURL =
      networkConfig[env as NetworkNames] || networkConfig['development']

    this.provider = new ethers.providers.JsonRpcProvider(networkURL)
  }

  getProvider() {
    return this.provider
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
