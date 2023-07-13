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
    freePredictions: string[]
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
    freePredictions: []
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
    freePredictions: []
  },
  barge: {
    chainId: '8996',
    subgraph:
      'http://localhost:9000/subgraphs/name/oceanprotocol/ocean-subgraph',
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
    freePredictions: ['0x54b5ebeed85f4178c6cb98dd185067991d058d55']
  },
  mock: {
    chainId: '23295',
    subgraph:
      'http://localhost:9000/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    freePredictions: []
  }
}
