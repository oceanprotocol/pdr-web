import { Maybe } from './utils'

export type TRunEnvironments = 'staging' | 'production' | 'barge' | 'mock'
export type TRuntimeConfig = Record<
  TRunEnvironments,
  {
    chainId: string
    subgraph: string
    tokenPredictions: Array<{
      tokenName: string
      pairName: string
      market: string
    }>
    opfProvidedPredictions: Array<string>
    whiteListedPredictions: Maybe<Array<string>>
  }
>

export const config: TRuntimeConfig = {
  staging: {
    chainId: '23295',
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
    whiteListedPredictions: []
  },
  production: {
    chainId: '23295',
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
    whiteListedPredictions: []
  },
  barge: {
    chainId: '8996',
    subgraph: `${process.env.NEXT_PUBLIC_DEV_GRAPHQL_HOST}:9000/subgraphs/name/oceanprotocol/ocean-subgraph`,
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
    opfProvidedPredictions: [
      '0x54b5ebeed85f4178c6cb98dd185067991d058d55',
      '0x2d30d9b506f8df53058674a8be8722b073edf6a5'
    ],
    whiteListedPredictions: [
      '0x3586b0ff8e98dbdcb1cb7d8620bf6cd9246a47a5',
      '0xdb0fb92fd13dd6d9d7b828369efe833ea5ad18b3'
    ]
  },
  mock: {
    chainId: '23295',
    subgraph: `${process.env.NEXT_PUBLIC_DEV_GRAPHQL_HOST}:9000/subgraphs/name/oceanprotocol/ocean-subgraph`,
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [],
    whiteListedPredictions: []
  }
}
