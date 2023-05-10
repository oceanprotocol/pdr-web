import { useEffect, useState } from 'react'
import config from '../metadata/config.json'
import styles from '../styles/PredictionsTable.module.css'
import { TokenData, getTokenData } from '../utils/coin'
import AmountInput from './AmountInput'
import Coin from './Coin'
import Prediction from './Prediction'
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
    Header: 'Next prediction',
    accessor: 'nextPrediction'
  },
  {
    Header: 'Current Prediction',
    accessor: 'currentPrediction'
  }
]

export default function PredictionsTable() {
  interface TableData {
    [key: string]: any
  }

  const [tableData, setTableData] = useState<TableData[]>()

  const loadTableData = async () => {
    config.forEach(async (data) => {
      let newData: any = []
      let row: any = {}
      let tokenData: TokenData = await getTokenData(data.cg_id)
      row['coin'] = <Coin coinData={tokenData} />
      row['price'] = `$${tokenData.price}`
      row['amount'] = <AmountInput />
      row['nextPrediction'] = (
        <Prediction
          epochOffset={0}
          predictoorContractAddress={data.pairAddress}
        />
      )
      row['currentPrediction'] = (
        <Prediction
          epochOffset={0}
          predictoorContractAddress={data.pairAddress}
        />
      )
      newData.push(row)
      setTableData(newData)
    })
  }
  useEffect(() => {
    loadTableData()
  }, [])

  useEffect(() => {
    console.log(tableData)
  }, [tableData])

  return tableData ? (
    <div className={styles.container}>
      <Table columns={tableColumns} data={tableData} />
    </div>
  ) : (
    <div>Loading</div>
  )
}
