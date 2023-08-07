import React from 'react'
import { HeaderNextElement } from '../elements/HeaderNextElement'
import { config } from './config'

export const currentConfig = process.env.NEXT_PUBLIC_ENV
  ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
  : config['staging']

export const assetTableColumns = [
  {
    Header: 'Asset',
    accessor: 'asset'
  },
  {
    Header: 'Price',
    accessor: 'price'
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
  },
  {
    Header: 'Subscription',
    accessor: 'subscription'
  }
]
