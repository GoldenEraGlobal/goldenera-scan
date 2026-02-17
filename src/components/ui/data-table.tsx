import {
    type Table as TanstackTable,
    flexRender,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"

import {
    MobileTableHead,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Inbox } from "lucide-react"
import * as m from "@/paraglide/messages"

interface DataTableProps<TData> {
    table: TanstackTable<TData>
    isLoading?: boolean
    rowCount?: number
    emptyTitle?: string
    emptyDescription?: string
    emptyIcon?: React.ReactNode
}

export function DataTable<TData>({
    table,
    isLoading,
    rowCount = 5,
    emptyTitle,
    emptyDescription,
    emptyIcon
}: DataTableProps<TData>) {
    const defaultEmptyTitle = m.table_no_results()
    return (
        <div className='overflow-hidden'>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className={cn(isLoading && "opacity-50 pointer-events-none transition-opacity")}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            headerGroup.headers
                                                .filter((header) => header.column.id === cell.column.id)
                                                .map((header) => (
                                                    <MobileTableHead key={header.id}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </MobileTableHead>
                                                ))
                                        ))}
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : isLoading ? (
                        Array.from({ length: rowCount }).map((_, i) => (
                            <TableRow key={`skeleton-${i}`}>
                                {table.getAllColumns().map((column, j) => (
                                    <TableCell key={`skeleton-${i}-${j}`}>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            headerGroup.headers
                                                .filter((header) => header.column.id === column.id)
                                                .map((header) => (
                                                    <MobileTableHead key={header.id}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </MobileTableHead>
                                                ))
                                        ))}
                                        <Skeleton className="h-4 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={table.getAllColumns().length}
                                className="text-center no-pivoted"
                            >
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                                        {emptyIcon || <Inbox className="h-8 w-8 text-muted-foreground/50" />}
                                    </div>
                                    <p className="text-sm font-medium text-foreground mb-1">{emptyTitle ?? defaultEmptyTitle}</p>
                                    {emptyDescription && (
                                        <p className="text-xs text-muted-foreground">
                                            {emptyDescription}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}