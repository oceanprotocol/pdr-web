export const config = {
  staging: {
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
