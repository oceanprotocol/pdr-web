import React from 'react'
import styles from '../styles/Table.module.css'

type THTMLCellProps = React.DetailedHTMLProps<
  React.TdHTMLAttributes<HTMLTableCellElement>,
  HTMLTableCellElement
>

type THTMLRowProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLTableRowElement>,
  HTMLTableRowElement
>

export type TTableRowWrapperProps = {
  cellProps?: THTMLCellProps
  children: Array<React.ReactNode>
  cellType?: 'td' | 'th'
} & THTMLRowProps

export const TableRowWrapper: React.FC<TTableRowWrapperProps> = ({
  children,
  cellProps,
  cellType = 'td',
  ...rest
}) => {
  return (
    <tr {...rest}>
      {React.Children.map(children, (child: any, index) => {
        const isHeader = cellType === 'th'
        const cellKeyIndex = {
          key: `${isHeader ? 'header' : 'cell'}${index}`
        }
        return React.createElement(
          cellType,
          {
            ...cellProps,
            ...cellKeyIndex,
            colSpan: index === 4 || index === 0 ? 2 : 1,
            id:
              child?.props?.children === 'Asset' ||
              child?.props?.children === 'Price'
                ? styles.alignStart
                : ''
          },
          child
        )
      })}
    </tr>
  )
}
