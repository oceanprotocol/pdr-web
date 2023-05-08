import styles from '@/styles/PredictionsTable.module.css'
import config from '../metadata/config.json'
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
  [key: string]: string
}

let tableData: TableData[] = []
config.forEach((data) => {
  let index = 1
  let row: TableData = {}
  for (const [, value] of Object.entries(data)) {
    console.log(value)
    row[`col${index}`] = value
    index++
  }
  tableData.push(row)
})

export default function PredictionsTable() {
  return (
    <div className={styles.container}>
      <Table columns={tableColumns} data={tableData} />
    </div>
  )
}
