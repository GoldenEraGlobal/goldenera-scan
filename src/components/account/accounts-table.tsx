import { useMemo } from 'react'
import { useQueryState, parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { AddressLink } from '@/components/links'
import { TokenSelect } from '@/components/token/token-select'
import {
    cn,
    formatNum,
} from '@/lib/utils'
import { SortDropdown, type SortDirection } from '@/components/sort-dropdown'
import {
    Users,
    RefreshCw,
} from 'lucide-react'
import * as m from "@/paraglide/messages"
import type { AccountBalanceDtoV1 } from '@/api/gen'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ZERO_ADDRESS } from '@goldenera/cryptoj'
import { useTokenUtil } from '@/hooks/useTokenUtil'
import { DateTime } from '../date-time'
import { useAccounts } from '@/hooks/useAccounts'

// Props interface
interface AccountsTableProps {
    /** Page size */
    pageSize?: number
    /** Title for the table card */
    title?: string
    /** Optional class name */
    className?: string
}

export function AccountsTable({
    pageSize = 25,
    title,
    className,
}: AccountsTableProps) {
    // Default to native token or first available
    const [selectedTokenAddress, setSelectedTokenAddress] = useQueryState(
        'acc_token',
        parseAsString.withDefault(ZERO_ADDRESS)
    )

    const [direction, setDirection] = useQueryState(
        'acc_sort',
        parseAsStringEnum<SortDirection>(['ASC', 'DESC']).withDefault('DESC')
    )
    const [pageIndex, setPageIndex] = useQueryState(
        'acc_page',
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

    // Reset page when token changes
    const handleTokenChange = (address: string) => {
        setSelectedTokenAddress(address)
        setPageIndex(0)
    }

    const { formatWei } = useTokenUtil({
        tokenAddress: selectedTokenAddress
    })

    const {
        data: addresses = { list: [], totalPages: 1, totalElements: 0 },
        isLoading,
        refetch,
        isRefetching,
    } = useAccounts({
        page: pageIndex,
        pageSize,
        tokenAddress: selectedTokenAddress ?? ZERO_ADDRESS,
        direction
    })

    const columns = useMemo<ColumnDef<AccountBalanceDtoV1, any>[]>(() => {
        return [
            {
                id: 'rank',
                header: '#',
                cell: ({ row }) => (
                    <span className="text-muted-foreground font-medium text-xs">
                        {formatNum((pagination.pageIndex * pagination.pageSize + row.index + 1))}
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
                    <DateTime timestamp={row.original.updatedAtTimestamp} className="text-muted-foreground text-xs whitespace-nowrap" />
                ),
            },
        ]
    }, [pagination.pageIndex, pagination.pageSize, formatWei])

    const table = useReactTable({
        data: addresses?.list ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: addresses?.totalPages ?? 0,
        state: { pagination },
        onPaginationChange: setPagination,
    })

    return (
        <Card className={cn("gap-0", className)}>
            <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        {!title ? m.accounts_table_title() : title}
                        {addresses && (
                            <Badge variant="secondary" className="ml-2">
                                {formatNum(addresses.totalElements)}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <TokenSelect
                            value={selectedTokenAddress || undefined}
                            onValueChange={handleTokenChange}
                        />
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
                    isLoading={(!addresses && isLoading) || isRefetching}
                    rowCount={pagination.pageSize}
                    emptyIcon={<Users className="h-8 w-8 text-muted-foreground/50" />}
                    emptyTitle={m.addresses_empty()}
                    emptyDescription={m.addresses_empty_description()}
                />
            </CardContent>
            <DataTablePagination table={table} />
        </Card>
    )
}
