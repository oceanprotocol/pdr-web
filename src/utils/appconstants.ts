import { ethers } from 'ethers'
import React from 'react'
import { HeaderNextElement } from '../elements/HeaderNextElement'
import config from '../metadata/config.json'
import { networkProvider } from './networkProvider'

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

export const predictoorPK = process.env.NEXT_PUBLIC_PREDICTOOR_PK || ''

export const predictoorWallet = new ethers.Wallet(
  predictoorPK,
  networkProvider.getProvider()
)

export const overlapBlockCount = 100
