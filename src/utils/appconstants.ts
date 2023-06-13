import React from 'react'
import { HeaderNextElement } from '../elements/HeaderNextElement'
import config from '../metadata/config.json'

export const currentConfig = process.env.NEXT_PUBLIC_ENV
  ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
  : config['staging']

// TODO: we need to remove quotes from the keys
// when we configure the eslint rules again for typescript
export enum ECoinGeckoIdList {
  'ETH' = 'ethereum'
}

export type TCoinGeckoIdKeys = keyof typeof ECoinGeckoIdList

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
    Header: React.createElement(HeaderNextElement),
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
