import { Coins, LockKeyhole, RefreshCw } from 'lucide-react'
import { HashLink } from '@/components/links'
import { DateTime } from '@/components/date-time'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGlobalStats } from '@/hooks/useGlobalStats'
import { useMiningRewardTranches } from '@/hooks/useMiningRewardTranches'
import { useTokenUtil } from '@/hooks/useTokenUtil'
import { presentRewardVesting } from '@/lib/reward-vesting'
import { cn, formatNum } from '@/lib/utils'
import * as m from '@/paraglide/messages'

export function MiningRewardVesting({ address }: { address: string }) {
  const rewards = useMiningRewardTranches(address)
  const globalStats = useGlobalStats({ autoRefetch: true })
  const { formatWei } = useTokenUtil()
  const isRefreshing = rewards.isRefetching || globalStats.isRefetching

  const refresh = () => {
    void rewards.refetch()
    void globalStats.refetch()
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <LockKeyhole className="size-4 text-primary" />
              {m.vesting_title()}
            </CardTitle>
            <CardDescription>{m.vesting_description()}</CardDescription>
          </div>
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
        {rewards.isLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : rewards.data?.list?.length ? (
          <div className="divide-y">
            {rewards.data.list.map((reward) => {
              const vesting = presentRewardVesting(
                reward.unlockBlockHeight,
                globalStats.data?.latestBlock,
              )
              const statusLabel =
                vesting.status === 'immediate'
                  ? m.vesting_immediate()
                  : vesting.status === 'unlocked'
                    ? m.vesting_unlocked()
                    : m.vesting_locked()

              return (
                <div
                  key={reward.id ?? `${reward.blockHash}-${reward.to}`}
                  className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono font-semibold">
                      <Coins className="size-4 text-primary" />
                      {formatWei(reward.amount)}
                    </div>
                    <DateTime
                      timestamp={reward.timestamp}
                      className="text-xs text-muted-foreground"
                    />
                  </div>
                  <div className="text-sm sm:text-right">
                    <p className="text-xs text-muted-foreground">
                      {m.vesting_mined_at()}
                    </p>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <span className="font-mono">
                        #{formatNum(reward.blockHeight)}
                      </span>
                      {reward.blockHash ? (
                        <HashLink hash={reward.blockHash} type="block" />
                      ) : null}
                    </div>
                  </div>
                  <div className="text-sm sm:min-w-36 sm:text-right">
                    <p className="text-xs text-muted-foreground">
                      {m.vesting_unlock_at()}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="font-mono">
                        {reward.unlockBlockHeight == null
                          ? '—'
                          : `#${formatNum(reward.unlockBlockHeight)}`}
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        {m.vesting_blocks_remaining({
                          count: formatNum(vesting.remainingBlocks),
                        })}
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {m.vesting_no_rewards()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
