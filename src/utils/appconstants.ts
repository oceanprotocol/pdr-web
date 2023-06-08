import config from '../metadata/config.json'

export const currentConfig = process.env.NEXT_PUBLIC_ENV
  ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
  : config['staging']

export enum ECoinGeckoIdList {
  ETH = 'ethereum'
}

export type TCoingGeckoIdKeys = keyof typeof ECoinGeckoIdList

export const assetTableColumns = [
  {
    Header: 'Coin',
    accessor: 'coin'
  },
  {
    Header: 'Price',
    accessor: 'price'
  },
  {
    Header: 'Amount',
    accessor: 'amount'
  },
  {
    Header: 'Next',
    accessor: 'next'
  },
  {
    Header: 'Live',
    accessor: 'live'
  },
  {
    Header: 'History',
    accessor: 'history'
  }
]
