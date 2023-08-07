import { config } from './config'

export const currentConfig = process.env.NEXT_PUBLIC_ENV
  ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
  : config['staging']

// TODO: we need to remove quotes from the keys
// when we configure the eslint rules again for typescript
export enum ECoinGeckoIdList {
  'ETH' = 'ethereum',
  'BTC' = 'bitcoin',
  'XRP' = 'ripple'
}

export const PREDICTION_FETCH_EPOCHS_DELAY = 10

export type TCoinGeckoIdKeys = keyof typeof ECoinGeckoIdList

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
  },
  {
    Header: 'Timeframe',
    accessor: 'timegrame'
  },
  {
    Header: 'Subscription',
    accessor: 'subscription'
  }
]
