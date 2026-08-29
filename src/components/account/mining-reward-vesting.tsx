import { useEffect, useMemo } from 'react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Coins, LockKeyhole, RefreshCw } from 'lucide-react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import type { TransferDtoV1 } from '@/api/gen'
import { HashLink } from '@/components/links'
import { DateTime } from '@/components/date-time'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { useGlobalStats } from '@/hooks/useGlobalStats'
import { useMiningRewardTranches } from '@/hooks/useMiningRewardTranches'
import { useTokenUtil } from '@/hooks/useTokenUtil'
import { presentRewardVesting } from '@/lib/reward-vesting'
import { cn, formatNum } from '@/lib/utils'
import * as m from '@/paraglide/messages'

const PAGE_SIZE = 6

export function MiningRewardVesting({ address }: { address: string }) {
  const [pageIndex, setPageIndex] = useQueryState(
    'vesting_page',
    parseAsInteger.withDefault(0),
  )
  const pagination: PaginationState = useMemo(
    () => ({ pageIndex, pageSize: PAGE_SIZE }),
    [pageIndex],
  )
  const rewards = useMiningRewardTranches(address, pageIndex, PAGE_SIZE)
  const globalStats = useGlobalStats({ autoRefetch: true })
  const { formatWei } = useTokenUtil()
  const isRefreshing = rewards.isRefetching || globalStats.isRefetching

  useEffect(() => {
    const totalPages = rewards.data?.totalPages
    if (totalPages != null && pageIndex >= totalPages && pageIndex > 0) {
      void setPageIndex(Math.max(0, totalPages - 1))
    }
  }, [pageIndex, rewards.data?.totalPages, setPageIndex])

  const columns = useMemo<Array<ColumnDef<TransferDtoV1, unknown>>>(
    () => [
      {
        accessorKey: 'amount',
        header: m.common_amount(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 whitespace-nowrap font-mono text-xs font-semibold">
            <Coins className="size-4 text-primary" />
            {formatWei(row.original.amount)}
          </div>
        ),
      },
      {
        accessorKey: 'blockHeight',
        header: m.vesting_mined_at(),
        cell: ({ row }) => (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono">
                #{formatNum(row.original.blockHeight)}
              </span>
              {row.original.blockHash ? (
                <HashLink hash={row.original.blockHash} type="block" />
              ) : null}
            </div>
            <DateTime
              timestamp={row.original.timestamp}
              className="text-xs text-muted-foreground"
            />
          </div>
        ),
      },
      {
        accessorKey: 'unlockBlockHeight',
        header: m.vesting_unlock_at(),
        cell: ({ row }) => {
          const vesting = presentRewardVesting(
            row.original.unlockBlockHeight,
            globalStats.data?.latestBlock,
          )
          const statusLabel =
            vesting.status === 'immediate'
              ? m.vesting_immediate()
              : vesting.status === 'unlocked'
                ? m.vesting_unlocked()
                : m.vesting_locked()

          return (
            <div className="space-y-1 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono">
                  {row.original.unlockBlockHeight == null
                    ? '—'
                    : `#${formatNum(row.original.unlockBlockHeight)}`}
                </span>
                <Badge
                  variant={
                    vesting.status === 'locked' ? 'secondary' : 'outline'
                  }
                >
                  {statusLabel}
                </Badge>
              </div>
              {vesting.status === 'locked' &&
              globalStats.data?.latestBlock != null ? (
                <p className="text-xs text-muted-foreground">
                  {m.vesting_blocks_remaining({
                    count: formatNum(vesting.remainingBlocks),
                  })}
                </p>
              ) : null}
            </div>
          )
        },
      },
    ],
    [formatWei, globalStats.data?.latestBlock],
  )

  const table = useReactTable({
    data: rewards.data?.list ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: rewards.data?.totalPages ?? 0,
    state: { pagination },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      void setPageIndex(next.pageIndex)
    },
  })

  const refresh = () => {
    void rewards.refetch()
    void globalStats.refetch()
  }

  return (
    <Card className="gap-0">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <LockKeyhole className="size-4 text-primary" />
            {m.vesting_title()}
            {rewards.data ? (
              <Badge variant="secondary" className="ml-2">
                {formatNum(rewards.data.totalElements)}
              </Badge>
            ) : null}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn('size-4', isRefreshing && 'animate-spin')}
            />
            <span className="sr-only">{m.common_refresh()}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          table={table}
          isLoading={rewards.isLoading || rewards.isPlaceholderData}
          rowCount={PAGE_SIZE}
          emptyIcon={<Coins className="size-8 text-muted-foreground/50" />}
          emptyTitle={m.vesting_no_rewards()}
        />
      </CardContent>
      <DataTablePagination table={table} />
    </Card>
  )
}
