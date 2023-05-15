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
} as const satisfies Chain
