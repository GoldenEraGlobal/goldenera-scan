import { useMemo } from 'react'
import { useQueryState, parseAsInteger, parseAsStringEnum } from 'nuqs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { AddressLink, HashLink } from '@/components/links'
import { SortDropdown, type SortDirection } from '@/components/sort-dropdown'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import * as m from "@/paraglide/messages"
import {
    cn,
    formatNum,
} from '@/lib/utils'
import {
    Box,
    RefreshCw,
} from 'lucide-react'
import type { BlockHeaderDtoV1 } from '@/api/gen'
import { useTokenUtil } from '@/hooks/useTokenUtil'
import { DateTime } from '../date-time'
import { useBlocks } from '@/hooks/useBlocks'

// Props interface
interface BlocksTableProps {
    /** Filter by coinbase/miner address */
    coinbase?: string
    /** Page size */
    pageSize?: number
    /** Title for the table card */
    title?: string
    /** Optional class name */
    className?: string
}

export function BlocksTable({
    coinbase,
    pageSize = 25,
    title,
    className,
}: BlocksTableProps) {
    const [direction, setDirection] = useQueryState(
        'b_sort',
        parseAsStringEnum<SortDirection>(['ASC', 'DESC']).withDefault('DESC')
    )
    const [pageIndex, setPageIndex] = useQueryState(
        'b_page',
        parseAsInteger.withDefault(0)
    )

    const pagination: PaginationState = useMemo(() => ({
        pageIndex,
        pageSize,
    }), [pageIndex, pageSize])

    const setPagination = (updater: any) => {
        if (typeof updater === 'function') {
            const next = updater(pagination)
            setPageIndex(next.pageIndex)
        } else {
            setPageIndex(updater.pageIndex)
        }
    }

    const {
        data: blocks,
        isLoading,
        refetch,
        isRefetching,
        isPlaceholderData,
    } = useBlocks({
        coinbase,
        page: pageIndex,
        pageSize,
        direction
    })
    const { formatWei } = useTokenUtil()

    const columns = useMemo<ColumnDef<BlockHeaderDtoV1, any>[]>(() => {
        return [
            {
                accessorKey: 'height',
                header: m.common_height(),
                cell: ({ row }) => (
                    <span className="font-medium font-mono text-xs">
                        {formatNum(row.original.height)}
                    </span>
                ),
            },
            {
                accessorKey: 'hash',
                header: m.common_hash(),
                cell: ({ row }) => (
                    row.original.hash ? (
                        <HashLink hash={row.original.hash} type="block" className="text-xs" />
                    ) : (
                        <span className="text-muted-foreground">{m.common_na()}</span>
                    )
                ),
            },
            {
                accessorKey: 'coinbase',
                header: m.latest_blocks_coinbase(),
                cell: ({ row }) => (
                    row.original.coinbase ? (
                        <AddressLink address={row.original.coinbase} className="text-xs" />
                    ) : (
                        <span className="text-muted-foreground">{m.common_na()}</span>
                    )
                ),
            },
            {
                accessorKey: 'numberOfTxs',
                header: m.common_txs(),
                cell: ({ row }) => (
                    <Badge variant="secondary" className="text-xs font-mono">
                        {formatNum(row.original.numberOfTxs)}
                    </Badge>
                ),
            },
            {
                id: 'reward',
                header: m.common_reward(),
                cell: ({ row }) => (
                    <span className="font-medium font-mono text-xs whitespace-nowrap">
                        {formatWei(row.original.blockReward)}
                    </span>
                ),
            },
            {
                id: 'fees',
                header: m.common_fee(),
                cell: ({ row }) => (
                    <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {formatWei(row.original.totalFees)}
                    </span>
                ),
            },
            {
                accessorKey: 'timestamp',
                header: m.common_age(),
                cell: ({ row }) => (
                    <DateTime timestamp={row.original.timestamp} className="text-muted-foreground text-xs whitespace-nowrap" />
                ),
            },
        ]
    }, [])

    const table = useReactTable({
        data: blocks?.list ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: blocks?.totalPages ?? -1,
        state: { pagination },
        onPaginationChange: setPagination,
    })

    return (
        <Card className={cn("gap-0", className)}>
            <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Box className="h-4 w-4 text-primary" />
                        {title}
                        {blocks && (
                            <Badge variant="secondary" className="ml-2">
                                {formatNum(blocks.totalElements)}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <SortDropdown
                            value={direction}
                            onValueChange={(val) => {
                                setDirection(val)
                                setPageIndex(0)
                            }}
                            descLabel={m.sort_newest()}
                            ascLabel={m.sort_oldest()}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isRefetching}
                            className="h-8"
                        >
                            <RefreshCw className={cn('h-3.5 w-3.5', isRefetching && 'animate-spin')} />
                            <span className="sr-only">
                                {m.common_refresh()}
                            </span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <DataTable
                    table={table}
                    isLoading={isLoading || isPlaceholderData}
                    rowCount={pagination.pageSize}
                    emptyIcon={<Box className="h-8 w-8 text-muted-foreground/50" />}
                    emptyTitle={m.table_no_blocks()}
                    emptyDescription={m.table_no_blocks_filter()}
                />
            </CardContent>
            <DataTablePagination table={table} />
        </Card>
    )
}
