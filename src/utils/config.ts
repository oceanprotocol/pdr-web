export type TRunEnvironments = 'staging' | 'production' | 'barge' | 'mock'
export type TRuntimeConfig = Record<
  TRunEnvironments,
  {
    chainId: string
    subgraph: string
    oceanTokenAddress: `0x${string}`
    tokenPredictions: Array<{
      tokenName: string
      pairName: string
      market: string
    }>
    opfProvidedPredictions: Array<string>
    opfOwnerAddress: string
  }
>

export const config: TRuntimeConfig = {
  staging: {
    chainId: '23295',
    oceanTokenAddress: '0x5b43cf84a63925201da55ea0048f76bd70bb6be5',
    subgraph:
      'https://v4.subgraph.goerli.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [],
    opfOwnerAddress: ''
  },
  production: {
    chainId: '23295',
    oceanTokenAddress: '0x5b43cf84a63925201da55ea0048f76bd70bb6be5',
    subgraph:
      'https://v4.subgraph.mainnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [],
    opfOwnerAddress: ''
  },
  barge: {
    chainId: '8996',
    subgraph: `${process.env.NEXT_PUBLIC_DEV_GRAPHQL_HOST}/subgraphs/name/oceanprotocol/ocean-subgraph`,
    oceanTokenAddress: '0x5b43cf84a63925201da55ea0048f76bd70bb6be5',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDT',
        market: 'binance'
      },
      {
        tokenName: 'BTC',
        pairName: 'TUSD',
        market: 'binance'
      },
      {
        tokenName: 'XRP',
        pairName: 'USDT',
        market: 'kraken'
      }
    ],
    opfProvidedPredictions: [],
    opfOwnerAddress: '0xe2dd09d719da89e5a3d0f2549c7e24566e947260'
  },
  mock: {
    chainId: '23295',
    oceanTokenAddress: '0x5b43cf84a63925201da55ea0048f76bd70bb6be5',
    subgraph: `${process.env.NEXT_PUBLIC_DEV_GRAPHQL_HOST}/subgraphs/name/oceanprotocol/ocean-subgraph`,
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [],
    opfOwnerAddress: ''
  }
}
