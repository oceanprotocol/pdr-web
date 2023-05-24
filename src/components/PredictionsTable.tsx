import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { getAssetPairPrice } from '@/utils/exchange'
import { useEffect, useState } from 'react'
import config from '../metadata/config.json'
import styles from '../styles/PredictionsTable.module.css'
import { TokenData, getTokenData } from '../utils/coin'
import AmountInput from './AmountInput'
import Coin from './Coin'
import Prediction, { PredictionState } from './Prediction'
import Table from './Table'

const tableColumns = [
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

export default function PredictionsTable() {
  interface TableData {
    [key: string]: any
  }

  const currentConfig = process.env.NEXT_PUBLIC_ENV
    ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
    : config['staging']

  const [tableData, setTableData] = useState<TableData[]>()

  // TODO - Setup WSS/TWAP web3 databinding based on price feed
  const { price, updatePrice } = useLocalEpochContext()

  const loadTableData = async () => {
    currentConfig.tokenPredictions.forEach(async (data: any) => {
      let newData: any = []
      let row: any = {}
      let tokenData: TokenData = await getTokenData(data.cg_id)
      let price = await getAssetPairPrice(data.tokenName + data.pairName)
      row['coin'] = <Coin coinData={tokenData} />
      row['price'] = `$${parseFloat(price).toFixed(2)}`
      row['amount'] = <AmountInput />
      row['next'] = (
        <Prediction
          state={PredictionState.Next}
          epochOffset={+1}
          predictoorContractAddress={data.predictoorContractAddress}
          config={data}
        />
      )
      row['live'] = (
        <Prediction
          state={PredictionState.Live}
          epochOffset={0}
          predictoorContractAddress={data.predictoorContractAddress}
          config={data}
        />
      )
      row['history'] = (
        <Prediction
          state={PredictionState.History}
          epochOffset={-1}
          predictoorContractAddress={data.predictoorContractAddress}
          config={data}
        />
      )

      newData.push(row)
      setTableData(newData)

      // If in local mode, we want to use the mock data & implementation
      if (process.env.NEXT_PUBLIC_ENV == 'mock') {
        // Init the app w/ fresh CG data each time
        updatePrice(tokenData.price)
      }
    })
    // console.log(newData)
  }

  useEffect(() => {
    loadTableData()
  }, [])

  useEffect(() => {
    // console.log(tableData)
  }, [tableData])

  useEffect(() => {
    if (tableData) {
      tableData?.forEach(async (tableRow) => {
        let newData: any = []
        let row: any = {}
        row['coin'] = tableRow['coin']
        row['price'] = price
        row['amount'] = tableRow['amount']
        row['next'] = tableRow['next']
        row['live'] = tableRow['live']
        row['history'] = tableRow['history']
        newData.push(row)
        setTableData(newData)
      })
    }
  }, [price])

  return tableData ? (
    <div className={styles.container}>
      <Table columns={tableColumns} data={tableData} />
    </div>
  ) : (
    <div>Loading</div>
  )
}
