import { useEffect, useState } from 'react';
import config from '../metadata/config.json';
import styles from '../styles/PredictionsTable.module.css';
import { getTokenData, TokenData } from '../utils/coin';
import Coin from './Coin';
import Prediction, { PredictionState } from './Prediction';
import Table from './Table';

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

  const loadTableData = async () => {
    config.forEach(async (data) => {
      let newData: any = []
      let row: any = {}
      let tokenData: TokenData = await getTokenData(data.cg_id)
      row['coin'] = <Coin coinData={tokenData} />
      row['price'] = `$${tokenData.price}`
      row['amount'] = ''
      row['next'] = (
        <Prediction
          state={PredictionState.Next}
          epochOffset={+1}
          predictoorContractAddress={data.pairAddress}
        />
      )
      row['live'] = (
        <Prediction
          state={PredictionState.Live}
          epochOffset={0}
          predictoorContractAddress={data.pairAddress}
        />
      )
      row['history'] = (
        <Prediction
          state={PredictionState.History}
          epochOffset={-1}
          predictoorContractAddress={data.pairAddress}
        />
      )
      newData.push(row)
      setTableData(newData)
      // console.log(newData)
    })
  }
  useEffect(() => {
    loadTableData()
  }, [])

  useEffect(() => {
    // console.log(tableData)
  }, [tableData])

  return tableData ? (
    <div className={styles.container}>
      <Table columns={tableColumns} data={tableData} />
    </div>
  ) : (
    <div>Loading</div>
  )
}