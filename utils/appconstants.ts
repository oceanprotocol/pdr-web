import { ReactElement } from 'react'
import { config } from './config'
import { EPredictoorContractInterval } from './types/EPredictoorContractInterval'

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
    Header: 'Accuracy',
    accessor: 'accuracy'
  },
  {
    Header: 'Stake',
    accessor: 'stake'
  }
]

export type TAvailableTimeFrames = Array<{
  label: string
  value: EPredictoorContractInterval
}>

export const availableTimeFrames: TAvailableTimeFrames = [
  {
    label: '5m',
    value: EPredictoorContractInterval.e_5M
  },
  {
    label: '1h',
    value: EPredictoorContractInterval.e_1H
  }
]
