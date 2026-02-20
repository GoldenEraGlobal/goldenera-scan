import { useMemo } from 'react'
import { useQueryState, parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs'
import { apiV1TxGetPageQueryParamsTypeEnum } from '@/api/gen/types/ApiV1TxGetPage'
import { useTokens } from '@/hooks/useTokens'
import { useTransactions } from '@/hooks/useTransactions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { Button } from '@/components/ui/button'
import * as m from "@/paraglide/messages"
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
import { SortDropdown, type SortDirection } from '@/components/sort-dropdown'
import {
    compareAddress,
    formatWei,
    formatTransferType,
    cn,
    isNativeToken,
    formatNum,
} from '@/lib/utils'
import {
    ArrowDownLeft,
    ArrowUpRight,
    FileText,
    Filter,
    RefreshCw,
} from 'lucide-react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { TxDtoV1 } from '@/api/gen'
import { DateTime } from '../date-time'

const getTransferTypes = () => Object.entries(apiV1TxGetPageQueryParamsTypeEnum).map(
    ([_key, value]) => ({
        value,
        label: formatTransferType(value),
    })
)

// Schemas

// Props interface
interface TxTableProps {
    /** Filter by address (any direction) */
    address?: string
    /** Filter by token address */
    tokenAddress?: string
    /** Filter by transaction hash */
    txHash?: string
    /** Filter by block hash */
    blockHash?: string
    /** Show filter tabs (All/Received/Sent) */
    showFilterTabs?: boolean
    /** Page size */
    pageSize?: number
    /** Title for the table card */
    title?: string
    /** Optional class name */
    className?: string
    canRefresh?: boolean
}

export function TxTable({
    address,
    tokenAddress,
    txHash,
    blockHash,
    showFilterTabs = false,
    pageSize = 15,
    title,
    className,
    canRefresh = true,
}: TxTableProps) {
    const [pageIndex, setPageIndex] = useQueryState(
        't_page',
        parseAsInteger.withDefault(0)
    )
    const [direction, setDirection] = useQueryState(
        't_sort',
        parseAsStringEnum<SortDirection>(['ASC', 'DESC']).withDefault('DESC')
    )
    const [txFilter, setTxFilter] = useQueryState(
        't_filter',
        parseAsStringEnum<'all' | 'sent' | 'received'>(['all', 'sent', 'received']).withDefault('all')
    )
    const [typeFilter, setTypeFilter] = useQueryState(
        't_type',
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

    // Build query params based on filter
    const queryParams = (() => {
        const base = { page: pageIndex, pageSize: pageSize, tokenAddress, referenceHash: txHash, blockHash, type: typeFilter || undefined, direction }
        if (!address) {
            return base
        }
        if (txFilter === 'sent') {
            return { ...base, sender: address }
        }
        if (txFilter === 'received') {
            return { ...base, recipient: address }
        }
        return { ...base, address }
    })()

    // Fetch transfers
    const {
        data: transfers,
        isLoading: transfersLoading,
        refetch: refetchTransfers,
        isRefetching: transfersRefetching,
        isPlaceholderData,
    } = useTransactions(queryParams)

    // Fetch tokens for formatting
    const { data: tokens } = useTokens()

    // Reset page on filter change
    const handleFilterChange = (filter: 'all' | 'sent' | 'received') => {
        setTxFilter(filter)
        setPageIndex(0)
    }

    // Build columns with context
    const columns = useMemo<ColumnDef<TxDtoV1, any>[]>(() => {
        const tokensList = tokens || []
        const nativeToken = tokensList.find((t: any) => isNativeToken(t.address))
        const nativeDecimals = nativeToken?.numberOfDecimals ?? 8
        const nativeSymbol = nativeToken?.smallestUnitName ?? ''

        return [
            {
                accessorKey: 'hash',
                header: m.common_hash(),
                cell: ({ row }) => {
                    const hash = row.original.hash
                    return hash ? (
                        <HashLink hash={hash} type="tx" className="text-xs" />
                    ) : (
                        <Badge variant="secondary" className="text-xs">{m.common_system()}</Badge>
                    )
                },
            },
            {
                accessorKey: 'type',
                header: m.common_type(),
                cell: ({ row }) => (
                    <Badge variant="secondary" className="text-xs">
                        {formatTransferType(row.original.type)}
                    </Badge>
                ),
            },
            {
                accessorKey: 'sender',
                header: m.common_from(),
                cell: ({ row }) => (
                    <AddressLink address={row.original.sender} className="text-xs" />
                ),
            },
            {
                accessorKey: 'recipient',
                header: m.common_to(),
                cell: ({ row }) => (
                    <AddressLink address={row.original.recipient} className="text-xs" />
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
                    const isSent = address ? compareAddress(transfer.sender, address) : false
                    const isReceived = address ? compareAddress(transfer.recipient, address) : false

                    return (
                        <span className={cn(
                            'font-medium font-mono text-xs whitespace-nowrap',
                            address && (isSent ? 'text-destructive' : isReceived ? 'text-success' : '')
                        )}>
                            {!!transfer.amount ? (
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
                cell: ({ row }) => (
                    <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                        {!!row.original.fee ? (
                            <>
                                {formatWei(row.original.fee, nativeDecimals)} {nativeSymbol}
                            </>
                        ) : '-'}
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
    }, [tokens, address])

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
                        <FileText className="h-4 w-4 text-primary" />
                        {title ?? m.header_transactions()}
                        {transfers && (
                            <Badge variant="secondary" className="ml-2">
                                {formatNum(transfers.totalElements)}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Filter Tabs - only show when address is provided */}
                        {showFilterTabs && address && (
                            <div className="flex bg-muted rounded-lg p-1">
                                <button
                                    disabled={transfersLoading}
                                    onClick={() => handleFilterChange('all')}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                        txFilter === 'all'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {m.common_all()}
                                </button>
                                <button
                                    disabled={transfersLoading}
                                    onClick={() => handleFilterChange('received')}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1',
                                        txFilter === 'received'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <ArrowDownLeft className="h-3 w-3" />
                                    {m.common_received()}
                                </button>
                                <button
                                    disabled={transfersLoading}
                                    onClick={() => handleFilterChange('sent')}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1',
                                        txFilter === 'sent'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <ArrowUpRight className="h-3 w-3" />
                                    {m.common_sent()}
                                </button>
                            </div>
                        )}
                        {/* Type Filter Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger render={<Button
                                disabled={transfersLoading}
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
                                    {getTransferTypes().map((t) => (
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
                        {canRefresh && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetchTransfers()}
                                disabled={transfersRefetching}
                                className="h-8"
                            >
                                <RefreshCw className={cn('h-3.5 w-3.5', transfersRefetching && 'animate-spin')} />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <DataTable
                    table={table}
                    isLoading={transfersLoading || isPlaceholderData}
                    rowCount={pageSize}
                    emptyIcon={<FileText className="h-8 w-8 text-muted-foreground/50" />}
                    emptyTitle={m.table_no_transactions()}
                    emptyDescription={
                        address && txFilter !== 'all'
                            ? m.table_no_transactions_filter({ filter: txFilter })
                            : m.table_no_history()
                    }
                />
            </CardContent>

            <DataTablePagination table={table} />
        </Card>
    )
}
