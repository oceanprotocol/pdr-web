import styles from '@/styles/PredictionsTable.module.css'
import config from '../metadata/config.json'
import Prediction from './Prediction'
import Table from './Table'

const tableColumns = [
  {
    Header: 'Coin',
    accessor: 'col1'
  },
  {
    Header: 'Price',
    accessor: 'col2'
  },
  {
    Header: 'Amount',
    accessor: 'col3'
  },
  {
    Header: 'Next prediction',
    accessor: 'col4'
  },
  {
    Header: 'Current Prediction',
    accessor: 'col5'
  }
]

interface TableData {
  [key: string]: any
}

let tableData: TableData[] = []
config.forEach((data) => {
  let index = 1
  let row: TableData = {}
  for (const [, value] of Object.entries(data)) {
    row[`col${index}`] = value
    index++
  }
  row['col4'] = <Prediction epochOffset={0} predictoorContractAddress="0x" />
  row['col5'] = <Prediction epochOffset={0} predictoorContractAddress="0x" />
  tableData.push(row)
})

export default function PredictionsTable() {
  return (
    <div className={styles.container}>
      <Table columns={tableColumns} data={tableData} />
    </div>
  )
}
