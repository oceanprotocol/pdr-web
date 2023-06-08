import React from 'react'

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
      {React.Children.map(children, (child, index) => {
        const isHeader = cellType === 'th'
        const cellKeyIndex = {
          key: `${isHeader ? 'header' : 'cell'}${index}`
        }
        return React.createElement(
          cellType,
          { ...cellProps, ...cellKeyIndex },
          child
        )
      })}
    </tr>
  )
}
