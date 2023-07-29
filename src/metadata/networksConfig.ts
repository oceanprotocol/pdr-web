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
    public: { http: [process.env.NEXT_PUBLIC_DEV_GANACHE_HOST] },
    default: { http: [process.env.NEXT_PUBLIC_DEV_GANACHE_HOST] }
  },
  blockExplorers: {
    etherscan: {
      name: 'Ganache',
      url: process.env.NEXT_PUBLIC_DEV_GANACHE_HOST
    },
    default: {
      name: 'Ganache',
      url: process.env.NEXT_PUBLIC_DEV_GANACHE_HOST
    }
  }
} as Chain
