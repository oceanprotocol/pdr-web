import { ReactElement } from 'react'
import { config } from './config'

export const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  //const seconds = String(date.getSeconds()).padStart(2, '0')

  //return `${hours}:${minutes}:${seconds}`
  return `${hours}:${minutes}`
}

export const currentConfig = process.env.NEXT_PUBLIC_ENV
  ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
  : config['staging']

export const PREDICTION_FETCH_EPOCHS_DELAY = 10

interface TABLE_COLUMN {
  Header: string | ReactElement
  accessor: string
}

type ASSET_TABLE_COLUMNS = TABLE_COLUMN[]

export const assetTableColumns: ASSET_TABLE_COLUMNS = [
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
