import { config } from './config'

export const currentConfig = process.env.NEXT_PUBLIC_ENV
  ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
  : config['staging']

export const PREDICTION_FETCH_EPOCHS_DELAY = 10

export const assetTableColumns = [
  {
    Header: 'Asset',
    accessor: 'asset'
  },
  {
    Header: '14:00',
    accessor: 'history2'
  },
  {
    Header: '14:05',
    accessor: 'history1'
  },
  {
    Header: '14:08',
    accessor: 'live'
  },
  {
    Header: '14:10',
    accessor: 'prediction'
  },
  {
    Header: 'Accuracy(24h)',
    accessor: 'accuracy'
  },
  {
    Header: 'Subscription',
    accessor: 'subscription'
  }
]
