import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useEffect, useState } from 'react'
import config from '../metadata/config.json'
import styles from '../styles/PredictionsTable.module.css'
import { getTokenData, TokenData } from '../utils/coin'
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

  const [tableData, setTableData] = useState<TableData[]>()
  const { price, updatePrice } = useLocalEpochContext()

  const loadTableData = async () => {
    config.forEach(async (data) => {
      let newData: any = []
      let row: any = {}
      let tokenData: TokenData = await getTokenData(data.cg_id)
      row['coin'] = <Coin coinData={tokenData} />
      row['price'] = `$${tokenData.price}`
      row['amount'] = <AmountInput />
      row['next'] = (
        <Prediction
          state={PredictionState.Next}
          epochOffset={+1}
          predictoorContractAddress={data.pairAddress}
          config={data}
        />
      )
      row['live'] = (
        <Prediction
          state={PredictionState.Live}
          epochOffset={0}
          predictoorContractAddress={data.pairAddress}
          config={data}
        />
      )
      row['history'] = (
        <Prediction
          state={PredictionState.History}
          epochOffset={-1}
          predictoorContractAddress={data.pairAddress}
          config={data}
        />
      )

      newData.push(row)
      setTableData(newData)
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
