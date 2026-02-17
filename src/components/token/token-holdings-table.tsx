import { useMemo } from 'react'
import { useQueryState, parseAsInteger, parseAsStringEnum } from 'nuqs'
import { useTokens } from '@/hooks/useTokens'
import { useTokenHoldings } from '@/hooks/useTokenHoldings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTable } from '@/components/ui/data-table'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { AddressLink } from '@/components/links'
import { SortDropdown, type SortDirection } from '@/components/sort-dropdown'
import {
    compareAddress,
    formatWei,
    cn,
    formatNum,
} from '@/lib/utils'
import {
    Coins,
    RefreshCw,
} from 'lucide-react'
import * as m from "@/paraglide/messages"
import type { AccountBalanceDtoV1 } from '@/api/gen'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { DateTime } from '../date-time'

// Schemas

// Props interface
interface TokenHoldingsTableProps {
    /** The address to show token holdings for */
    address: string
    /** Page size */
    pageSize?: number
    /** Title for the table card */
    title?: string
    /** Optional class name */
    className?: string
}

export function TokenHoldingsTable({
    address,
    pageSize = 10,
    title,
    className,
}: TokenHoldingsTableProps) {
    const [direction, setDirection] = useQueryState(
        'thd_sort',
        parseAsStringEnum<SortDirection>(['ASC', 'DESC']).withDefault('DESC')
    )
    const [pageIndex, setPageIndex] = useQueryState(
        'thd_page',
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

    // Fetch balances
    const {
        data: balances,
        isLoading: balancesLoading,
        refetch: refetchBalances,
        isRefetching: balancesRefetching,
    } = useTokenHoldings({
        address,
        page: pageIndex,
        pageSize,
        direction
    })

    // Fetch tokens for formatting
    const { data: tokens } = useTokens()

    const columns = useMemo<ColumnDef<AccountBalanceDtoV1, any>[]>(() => {
        const tokensList = tokens || []

        return [
            {
                id: 'token',
                header: m.tx_detail_token(),
                cell: ({ row }) => {
                    const balance = row.original
                    const token = tokensList.find((t: any) => compareAddress(t.address, balance.tokenAddress))
                    const name = token?.name ?? m.common_unknown_token()
                    const symbol = token?.smallestUnitName ?? ''
                    const logoUrl = token?.logoUrl

                    return (
                        <div className="flex items-center gap-2">
                            <Avatar size="sm">
                                {logoUrl ? (
                                    <AvatarImage src={logoUrl} alt={name} />
                                ) : null}
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                                    {name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="font-medium truncate text-xs">{name}</span>
                                {symbol && (
                                    <span className="text-xs text-muted-foreground">{symbol}</span>
                                )}
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: 'tokenAddress',
                header: m.common_address(),
                cell: ({ row }) => (
                    <AddressLink address={row.original.tokenAddress} className="text-xs" type="token" />
                ),
            },
            {
                accessorKey: 'balance',
                header: m.common_balance(),
                cell: ({ row }) => {
                    const balance = row.original
                    const token = tokensList.find((t: any) => compareAddress(t.address, balance.tokenAddress))
                    const symbol = token?.smallestUnitName ?? ''
                    const decimals = token?.numberOfDecimals ?? 8
                    return (
                        <span className="font-medium font-mono text-xs whitespace-nowrap">
                            {formatWei(balance.balance, decimals)} {symbol}
                        </span>
                    )
                },
            },
            {
                accessorKey: 'updatedAtTimestamp',
                header: m.common_last_updated(),
                cell: ({ row }) => (
                    <DateTime className="text-muted-foreground text-xs whitespace-nowrap" timestamp={row.original.updatedAtTimestamp} />
                ),
            },
        ]
    }, [tokens])

    const table = useReactTable({
        data: balances?.list ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: balances?.totalPages ?? -1,
        state: { pagination },
        onPaginationChange: setPagination,
    })

    return (
        <Card className={cn("gap-0", className)}>
            <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Coins className="h-4 w-4 text-primary" />
                        {title ?? m.address_token_holdings()}
                        {balances && (
                            <Badge variant="secondary" className="ml-2">
                                {formatNum(balances.totalElements)}
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
                            descLabel={m.sort_highest()}
                            ascLabel={m.sort_lowest()}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetchBalances()}
                            disabled={balancesRefetching}
                            className="h-8"
                        >
                            <RefreshCw className={cn('h-3.5 w-3.5', balancesRefetching && 'animate-spin')} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <DataTable
                    table={table}
                    isLoading={(!balances && balancesLoading) || balancesRefetching}
                    rowCount={pagination.pageSize}
                    emptyIcon={<Coins className="h-8 w-8 text-muted-foreground/50" />}
                    emptyTitle={m.table_no_token_holdings()}
                    emptyDescription={m.table_no_token_holdings_description()}
                />
            </CardContent>
            <DataTablePagination table={table} />
        </Card>
    )
}
