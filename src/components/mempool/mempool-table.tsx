import { useMemo } from 'react'
import { useQueryState, parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs'
import { apiV1MemTransferGetPageQueryParamsTransferTypeEnum } from '@/api/gen/types/ApiV1MemTransferGetPage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { SortDropdown, type SortDirection } from '@/components/sort-dropdown'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { AddressLink, HashLink } from '@/components/links'
import { useTokens } from '@/hooks/useTokens'
import * as m from "@/paraglide/messages"
import {
    compareAddress,
    formatWei,
    formatTransferType,
    cn,
    isNativeToken,
    formatNum,
} from '@/lib/utils'
import {
    Inbox,
    Filter,
    RefreshCw,
} from 'lucide-react'
import type { MemTransferDtoV1 } from '@/api/gen'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { DateTime } from '../date-time'
import { useMempoolTransactions } from '@/hooks/useMempoolTransactions'

const TRANSFER_TYPES = () => Object.entries(apiV1MemTransferGetPageQueryParamsTransferTypeEnum).map(
    ([_key, value]) => ({
        value,
        label: formatTransferType(value),
    })
)

// Props interface
interface MempoolTableProps {
    /** Filter by address (any direction) */
    address?: string
    /** Filter by token address */
    tokenAddress?: string
    /** Page size */
    pageSize?: number
    /** Title for the table card */
    title?: string
    /** Optional class name */
    className?: string
}

export function MempoolTable({
    address,
    tokenAddress,
    pageSize = 25,
    title,
    className,
}: MempoolTableProps) {
    const types = useMemo(() => TRANSFER_TYPES(), [])
    const [direction, setDirection] = useQueryState(
        'm_sort',
        parseAsStringEnum<SortDirection>(['ASC', 'DESC']).withDefault('DESC')
    )
    const [pageIndex, setPageIndex] = useQueryState(
        'm_page',
        parseAsInteger.withDefault(0)
    )
    const [typeFilter, setTypeFilter] = useQueryState(
        'm_type',
        parseAsString.withOptions({ clearOnDefault: true })
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
        data: transfers,
        isLoading,
        refetch,
        isRefetching,
    } = useMempoolTransactions({
        address,
        tokenAddress,
        transferType: typeFilter || undefined,
        page: pageIndex,
        pageSize,
        direction
    })

    const { data: tokens } = useTokens()

    const columns = useMemo<ColumnDef<MemTransferDtoV1, any>[]>(() => {
        const tokensList = tokens || []

        return [
            {
                accessorKey: 'hash',
                header: m.common_hash(),
                cell: ({ row }) => {
                    const hash = row.original.hash
                    return hash ? (
                        <HashLink hash={hash} type="tx" className="text-xs" />
                    ) : (
                        <Badge variant="secondary" className="text-xs">SYSTEM</Badge>
                    )
                },
            },
            {
                accessorKey: 'transferType',
                header: m.common_type(),
                cell: ({ row }) => (
                    <Badge variant="secondary" className="text-xs">
                        {formatTransferType(row.original.transferType)}
                    </Badge>
                ),
            },
            {
                accessorKey: 'from',
                header: m.common_from(),
                cell: ({ row }) => (
                    <AddressLink address={row.original.from} className="text-xs" />
                ),
            },
            {
                accessorKey: 'to',
                header: m.common_to(),
                cell: ({ row }) => (
                    <AddressLink address={row.original.to} className="text-xs" />
                ),
            },
            {
                accessorKey: 'amount',
                header: m.common_amount(),
                cell: ({ row }) => {
                    const transfer = row.original
                    const token = tokensList.find((t: any) => compareAddress(t.address, transfer.tokenAddress))
                    const decimals = token?.numberOfDecimals ?? 8
                    const symbol = token?.smallestUnitName ?? ''
                    const isSent = address ? compareAddress(transfer.from, address) : false
                    const isReceived = address ? compareAddress(transfer.to, address) : false

                    return (
                        <span className={cn(
                            'font-medium font-mono text-xs whitespace-nowrap',
                            address && (isSent ? 'text-destructive' : isReceived ? 'text-success' : '')
                        )}>
                            {typeof transfer.amount === 'number' ? (
                                <>
                                    {address && isSent && '-'}
                                    {address && isReceived && '+'}
                                    {formatWei(transfer.amount, decimals)} {symbol}
                                </>
                            ) : '-'}
                        </span>
                    )
                },
            },
            {
                accessorKey: 'fee',
                header: m.common_fee(),
                cell: ({ row }) => {
                    const { data: tokens } = useTokens()
                    const nativeToken = tokens?.find((t: any) => isNativeToken(t.address))
                    const nativeDecimals = nativeToken?.numberOfDecimals ?? 8
                    const nativeSymbol = nativeToken?.smallestUnitName ?? ''

                    return (
                        <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                            {typeof row.original.fee === 'number' ? (
                                <>
                                    {formatWei(row.original.fee, nativeDecimals)} {nativeSymbol}
                                </>
                            ) : '-'}
                        </span>
                    )
                },
            },
            {
                accessorKey: 'addedAt',
                header: m.common_age(),
                cell: ({ row }) => (
                    <DateTime timestamp={row.original.addedAt} className="text-muted-foreground text-xs whitespace-nowrap" />
                ),
            },
        ]
    }, [tokens])

    const table = useReactTable({
        data: transfers?.list ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: transfers?.totalPages ?? -1,
        state: { pagination },
        onPaginationChange: setPagination,
    })

    return (
        <Card className={cn("gap-0", className)}>
            <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Inbox className="h-4 w-4 text-primary" />
                        {title ?? m.mempool_title()}
                        {transfers && (
                            <Badge variant="secondary" className="ml-2">
                                {formatNum(transfers.totalElements)}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Type Filter Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger render={<Button
                                disabled={isLoading}
                                variant="outline"
                                size="sm"
                                className={cn('h-8', typeFilter && 'border-primary text-primary')}
                            >
                                <Filter className="h-3.5 w-3.5" />
                            </Button>} />
                            <DropdownMenuContent align="end" className="w-[140px]">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>{m.table_filter_by_type()}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem
                                        checked={!typeFilter}
                                        onCheckedChange={() => {
                                            setTypeFilter(null)
                                            setPageIndex(0)
                                        }}
                                    >
                                        {m.table_all_types()}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuSeparator />
                                    {types.map((t) => (
                                        <DropdownMenuCheckboxItem
                                            key={t.value}
                                            checked={typeFilter === t.value}
                                            onCheckedChange={() => {
                                                setTypeFilter(t.value)
                                                setPageIndex(0)
                                            }}
                                        >
                                            {t.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <DataTable
                    table={table}
                    isLoading={(!transfers && isLoading) || isRefetching}
                    rowCount={pagination.pageSize}
                    emptyIcon={<Inbox className="h-8 w-8 text-muted-foreground/50" />}
                    emptyTitle={m.mempool_empty()}
                    emptyDescription={m.mempool_empty_description()}
                />
            </CardContent>
            <DataTablePagination table={table} />
        </Card>
    )
}
