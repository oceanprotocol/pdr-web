import styles from '@/styles/Table.module.css'
import { Column, useTable } from 'react-table'

export default function Table({
  columns,
  data
}: {
  columns: Column[]
  data: {}[]
}) {
  //console.log(columns, data)
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data })
  return (
    <table {...getTableProps()} className={styles.table}>
      <thead>
        {headerGroups.map((headerGroup, key) => (
          <tr
            {...headerGroup.getHeaderGroupProps()}
            className={styles.tableRow}
            key={key}
          >
            {headerGroup.headers.map((column, key) => (
              <th
                {...column.getHeaderProps()}
                className={styles.tableHeaderCell}
                key={key}
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, key) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()} className={styles.tableRow} key={key}>
              {row.cells.map((cell, key) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    className={styles.tableRowCell}
                    key={key}
                  >
                    {cell.render('Cell')}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
