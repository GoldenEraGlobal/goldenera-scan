import { useMemo } from 'react'
import { useQueryState, parseAsInteger, parseAsStringEnum } from 'nuqs'
import { useTokenHolders } from '@/hooks/useTokenHolders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { AddressLink } from '@/components/links'
import { SortDropdown, type SortDirection } from '@/components/sort-dropdown'
import {
    cn,
    formatNum
} from '@/lib/utils'
import {
    Users,
    RefreshCw,
} from 'lucide-react'
import * as m from "@/paraglide/messages"
import type { AccountBalanceDtoV1 } from '@/api/gen'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { DateTime } from '../date-time'
import { useTokenUtil } from '@/hooks/useTokenUtil'


interface TokenHoldersProps {
    tokenAddress: string
    className?: string
    title?: string
}

export function TokenHoldersTable({ tokenAddress, className, title }: TokenHoldersProps) {
    const { formatWei } = useTokenUtil({
        tokenAddress
    })
    const [direction, setDirection] = useQueryState(
        'th_sort',
        parseAsStringEnum<SortDirection>(['ASC', 'DESC']).withDefault('DESC')
    )
    const [pageIndex, setPageIndex] = useQueryState(
        'th_page',
        parseAsInteger.withDefault(0)
    )

    const pagination: PaginationState = useMemo(() => ({
        pageIndex,
        pageSize: 15,
    }), [pageIndex])

    const setPagination = (updater: any) => {
        if (typeof updater === 'function') {
            const next = updater(pagination)
            setPageIndex(next.pageIndex)
        } else {
            setPageIndex(updater.pageIndex)
        }
    }

    const {
        data: holders,
        isLoading,
        refetch,
        isRefetching,
    } = useTokenHolders({
        tokenAddress,
        page: pageIndex,
        pageSize: pagination.pageSize,
        direction
    })

    const columns = useMemo<ColumnDef<AccountBalanceDtoV1, any>[]>(() => [
        {
            id: 'rank',
            header: '#',
            cell: ({ row }) => (
                <span className="text-muted-foreground font-medium text-xs">
                    {formatNum(pagination.pageIndex * pagination.pageSize + row.index + 1)}
                </span>
            ),
        },
        {
            accessorKey: 'address',
            header: m.common_address(),
            cell: ({ row }) => (
                <AddressLink address={row.original.address} className="text-xs" />
            ),
        },
        {
            accessorKey: 'balance',
            header: m.common_balance(),
            cell: ({ row }) => (
                <span className="font-medium font-mono text-xs whitespace-nowrap">
                    {formatWei(row.original.balance)}
                </span>
            ),
        },
        {
            accessorKey: 'updatedAtTimestamp',
            header: m.common_last_updated(),
            cell: ({ row }) => (
                <DateTime className="text-muted-foreground text-xs whitespace-nowrap" timestamp={row.original.updatedAtTimestamp} />
            ),
        },
    ], [pagination.pageIndex, pagination.pageSize])

    const table = useReactTable({
        data: holders?.list ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: holders?.totalPages ?? -1,
        state: { pagination },
        onPaginationChange: setPagination,
    })

    return (
        <Card className={cn("gap-0", className)}>
            <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        {title ?? m.token_holders_title()}
                        {holders && (
                            <Badge variant="secondary" className="ml-2">
                                {formatNum(holders.totalElements)}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <SortDropdown
                            value={direction}
                            onValueChange={(val) => {
                                setDirection(val)
                                setPageIndex(0)
                            }}
                            descLabel={m.sort_highest()}
                            ascLabel={m.sort_lowest()}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isRefetching}
                            className="h-8"
                        >
                            <RefreshCw className={cn('h-3.5 w-3.5', isRefetching && 'animate-spin')} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <DataTable
                    table={table}
                    isLoading={(!holders && isLoading) || isRefetching}
                    rowCount={pagination.pageSize}
                    emptyIcon={<Users className="h-8 w-8 text-muted-foreground/50" />}
                    emptyTitle={m.token_holders_empty()}
                    emptyDescription={m.token_holders_empty_description()}
                />
            </CardContent>
            <DataTablePagination table={table} />
        </Card>
    )
}
