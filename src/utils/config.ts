import { Maybe } from './utils'

export type TRunEnvironments = 'staging' | 'production' | 'barge'
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
    allowedPredictions: Maybe<Array<string>>
    opfOwnerAddress: string
  }
>

export const config: TRuntimeConfig = {
  staging: {
    chainId: '23295',
    oceanTokenAddress: '0x973e69303259b0c2543a38665122b773d28405fb',
    subgraph:
      'https://v4.subgraph.sapphire-testnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [],
    allowedPredictions: [
      '0x8fffc7a9805856efa3d2c1276112eac505143857',
      '0x1456c74c421d46af30ef3c8a4f142d2f713ae325',
      '0x5b97fea1cb765e566c66a0d5be341b202ce208f5'
    ],
    opfOwnerAddress: '0xe02a421dfc549336d47efee85699bd0a3da7d6ff'
  },
  production: {
    chainId: '23295',
    oceanTokenAddress: '0x5b43cf84a63925201da55ea0048f76bd70bb6be5',
    subgraph: process.env.NEXT_PUBLIC_DEV_GRAPHQL_HOST
      ? `${process.env.NEXT_PUBLIC_DEV_GRAPHQL_HOST}/subgraphs/name/oceanprotocol/ocean-subgraph`
      : 'https://v4.subgraph.mainnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [],
    allowedPredictions: null,
    opfOwnerAddress: ''
  },
  barge: {
    chainId: '8996',
    subgraph: process.env.NEXT_PUBLIC_DEV_GRAPHQL_HOST
      ? `${process.env.NEXT_PUBLIC_DEV_GRAPHQL_HOST}/subgraphs/name/oceanprotocol/ocean-subgraph`
      : 'http://127.0.0.1:9000/subgraphs/name/oceanprotocol/ocean-subgraph',
    oceanTokenAddress: '0x2473f4f7bf40ed9310838edfca6262c17a59df64',
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
    opfProvidedPredictions: ['0x4e7eaeb4ab569e82af8c5fa9fa9191a9563ca35c'],
    allowedPredictions: null,
    opfOwnerAddress: '0xe2dd09d719da89e5a3d0f2549c7e24566e947260'
  }
}

/**
 * TODO: Fix the linting error
 */
export enum ELocalStorageKeys {
  'signedMessage' = 'signedMessage'
}
