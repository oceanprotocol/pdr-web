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
    Header: 'Asset (5m)',
    accessor: 'asset'
  },
  {
    Header: '--:--',
    accessor: 'history'
  },
  {
    Header: '--:--',
    accessor: 'history'
  },
  {
    Header: '--:--',
    accessor: 'live'
  },
  {
    Header: '--:--',
    accessor: 'prediction'
  },
  {
    Header: 'Accuracy 24h',
    accessor: 'accuracy'
  },
  {
    Header: 'Stake 24h',
    accessor: 'stake'
  }
]
