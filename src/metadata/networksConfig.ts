import { Chain } from 'wagmi'

export const oasis = {
  id: 23295,
  name: 'Oasis Sapphire Testnet',
  network: 'Oasis Sapphire Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Oasis Network',
    symbol: 'ROSE'
  },
  rpcUrls: {
    public: { http: ['https://testnet.sapphire.oasis.dev'] },
    default: { http: ['https://testnet.sapphire.oasis.dev'] }
  },
  blockExplorers: {
    etherscan: {
      name: 'SapphireTestnet',
      url: 'https://testnet.explorer.sapphire.oasis.dev'
    },
    default: {
      name: 'SapphireTestnet',
      url: 'https://testnet.explorer.sapphire.oasis.dev'
    }
  }
} as Chain

export const ganache = {
  id: 8996,
  name: 'Ganache',
  network: 'Ganache',
  nativeCurrency: {
    decimals: 18,
    name: 'Ganache Token',
    symbol: 'GNTK'
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545'] }
  },
  blockExplorers: {
    etherscan: {
      name: 'Ganache',
      url: 'http://127.0.0.1:8545'
    },
    default: {
      name: 'Ganache',
      url: 'http://127.0.0.1:8545'
    }
  }
} as Chain
