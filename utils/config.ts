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
    statisticsURL: string
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
    statisticsURL: 'https://websocket.predictoor.ai',
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
    allowedPredictions: [
      '0x18f54cc21b7a2fdd011bea06bba7801b280e3151',
      '0x2d8e2267779d27c2b3ed5408408ff15d9f3a3152',
      '0x30f1c55e72fe105e4a1fbecdff3145fc14177695',
      '0x31fabe1fc9887af45b77c7d1e13c5133444ebfbd',
      '0x3fb744c3702ff2237fc65f261046ead36656f3bc',
      '0x55c6c33514f80b51a1f1b63c8ba229feb132cedb',
      '0x74a61f733bd9a2ce40d2e39738fe4912925c06dd',
      '0x8165caab33131a4ddbf7dc79f0a8a4920b0b2553',
      '0x93f9d558ccde9ea371a20d36bd3ba58c7218b48f',
      '0x9c4a2406e5aa0f908d6e816e5318b9fc8a507e1f',
      '0xa2d9dbbdf21c30bb3e63d16ba75f644ac11a0cf0',
      '0xaa6515c138183303b89b98aea756b54f711710c5',
      '0xb1c55346023dee4d8b0d7b10049f0c8854823766',
      '0xbe09c6e3f2341a79f74898b8d68c4b5818a2d434',
      '0xd41ffee162905b45b65fa6b6e4468599f0490065',
      '0xd49cbfd694f4556c00023ddd3559c36af3ae0a80',
      '0xe66421fd29fc2d27d0724f161f01b8cbdcd69690',
      '0xf28c94c55d8c5e1d70ca3a82744225a4f7570b30',
      '0xf8c34175fc1f1d373ec67c4fd1f1ce57c69c3fb3',
      '0xfa69b2c1224cebb3b6a36fb5b8c3c419afab08dd'
    ],
    blacklistedPredictions: [''],
    opfOwnerAddress: '0x4ac2e51f9b1b0ca9e000dfe6032b24639b172703'
  },
  staging: {
    chainId: '23295',
    subgraph:
      'https://v4.subgraph.sapphire-testnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    websocketURL: 'https://test.websocket.predictoor.ai',
    statisticsURL: 'https://test.websocket.predictoor.ai',
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
    blacklistedPredictions: [
      '0x9dccb0fe8e7313141833b9ed96d5a90e3aa20bba',
      '0xfe588188c1021e5feeb5d5870e2ba222e07791c0',
      '0x388d104da5b8578e4e65cda016461692681257d5',
      '0x71a255e05a3f501e1a3bfc6dfe1c05e3e79213c3',
      '0x676170bf86926261a3021449bddbe438efebcd26',
      '0x6d434011fe93c4338925ad676a726d47b9e9305c',
      '0x6c5b4324a08ecc6a4414879e276430751c6bd700',
      '0x0423ac88aedb41343ff94cfb9cf60325b4fd07f8',
      '0xa792936b708418a9ea57b1ee18f65c71e988279a',
      '0xb35f6fbf1a8190b4baf9292dba31f17ca7ae772e'
    ],
    opfOwnerAddress: '0xe02a421dfc549336d47efee85699bd0a3da7d6ff'
  },
  development: {
    chainId: '8996',
    websocketURL: 'http://development.oceandao.org',
    statisticsURL: 'localhost:5000',
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
    statisticsURL: 'localhost:5000',
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
