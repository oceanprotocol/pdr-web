"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";

export type TableRowWrapperProps = React.ComponentProps<typeof TableRow> & {
  cellProps?: React.ComponentProps<typeof TableCell>;
  children: React.ReactNode;
  cellType?: "td" | "th";
};

export const TableRowWrapper: React.FC<TableRowWrapperProps> = ({
  children,
  cellProps,
  cellType = "td",
  className,
  ...rest
}) => {
  if (!children) return null;

  const CellComponent = cellType === "th" ? TableHead : TableCell;

  const childArray = React.Children.toArray(children);

  return (
    <TableRow className={className} {...rest}>
      {childArray.map((child, index) => {
        const isElement = React.isValidElement(child);
        const isAssetCell =
          isElement && (child.props as { id?: string })?.id === "asset";

        return (
          <CellComponent
            key={`${cellType === "th" ? "header" : "cell"}-${index}`}
            {...cellProps}
            className={cn(
              cellProps?.className,
              isAssetCell && "text-left"
            )}
          >
            {child}
          </CellComponent>
        );
      })}
    </TableRow>
  );
};
