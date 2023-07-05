export const config = {
  staging: {
    chainId: '23295',
    subgraph:
      'https://v4.subgraph.goerli.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        exchange: 'univ3'
      }
    ]
  },
  production: {
    chainId: '23295',
    subgraph:
      'https://v4.subgraph.mainnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        exchange: 'univ3'
      }
    ]
  },
  barge: {
    chainId: '8996',
    subgraph:
      'http://localhost:9000/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDT',
        exchange: 'binance'
      }
    ]
  },
  mock: {
    chainId: '23295',
    subgraph:
      'http://localhost:9000/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        exchange: 'univ3'
      }
    ]
  }
}
