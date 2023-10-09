import { Maybe } from './utils'

export type TRunEnvironments =
  | 'barge'
  | 'development'
  | 'staging'
  | 'production'
export type TRuntimeConfig = Record<
  TRunEnvironments,
  {
    chainId: string
    subgraph: string
    websocketURL: string
    oceanTokenAddress: `0x${string}`
    tokenPredictions: Array<{
      tokenName: string
      pairName: string
      market: string
    }>
    opfProvidedPredictions: Array<string>
    allowedPredictions: Maybe<Array<string>>
    blacklistedPredictions: Maybe<Array<string>>
    opfOwnerAddress: string
  }
>

export const config: TRuntimeConfig = {
  production: {
    chainId: '23294',
    oceanTokenAddress: '0x39d22b78a7651a76ffbde2aaab5fd92666aca520',
    websocketURL: 'https://websocket.predictoor.ai',
    subgraph:
      'https://v4.subgraph.sapphire-mainnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [
      '0xe66421fd29fc2d27d0724f161f01b8cbdcd69690',
      '0x8165caab33131a4ddbf7dc79f0a8a4920b0b2553'
    ],
    allowedPredictions: null,
    blacklistedPredictions: [''],
    opfOwnerAddress: '0x4ac2e51f9b1b0ca9e000dfe6032b24639b172703'
  },
  staging: {
    chainId: '23295',
    subgraph:
      'https://v4.subgraph.sapphire-testnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    websocketURL: 'https://test.websocket.predictoor.ai',
    oceanTokenAddress: '0x973e69303259b0c2543a38665122b773d28405fb',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [
      '0xda1e3c0ac74f2f10bb0c7635c9dc68bd3da0c95b',
      '0xc2c5c790b411a835742ed0d517df68fea958058d'
    ],
    allowedPredictions: null,
    blacklistedPredictions: [''],
    opfOwnerAddress: '0xe02a421dfc549336d47efee85699bd0a3da7d6ff'
  },
  development: {
    chainId: '8996',
    websocketURL: 'http://development.oceandao.org',
    subgraph:
      'https://development.oceandao.org/subgraphs/name/oceanprotocol/ocean-subgraph',
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
    blacklistedPredictions: [],
    opfOwnerAddress: '0xe2dd09d719da89e5a3d0f2549c7e24566e947260'
  },
  barge: {
    chainId: '8996',
    websocketURL: process.env.NEXT_PUBLIC_SOCKET_IO_URL
      ? process.env.NEXT_PUBLIC_SOCKET_IO_URL
      : 'http://127.0.0.1:8888',
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
    blacklistedPredictions: [],
    opfOwnerAddress: '0xe2dd09d719da89e5a3d0f2549c7e24566e947260'
  }
}

/**
 * TODO: Fix the linting error
 */
export enum ELocalStorageKeys {
  'signedMessage' = 'signedMessage'
}
