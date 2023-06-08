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
} & THTMLRowProps

export const TableRowWrapper: React.FC<TTableRowWrapperProps> = ({
  children,
  cellProps,
  ...rest
}) => {
  return (
    <tr {...rest}>
      {React.Children.map(children, (child, index) => {
        return (
          <td {...cellProps} key={index}>
            {child}
          </td>
        )
        /*
        const isHeader = cellType === 'th'
        const cellKeyIndex = {
          key: `${isHeader ? 'header' : 'cell'}${index}`
        }
        return React.createElement(
          cellType,
          { ...cellProps, ...cellKeyIndex },
          child
        )
        */
      })}
    </tr>
  )
}
