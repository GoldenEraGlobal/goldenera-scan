import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Clock,
  Flame,
  Hash,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { DateTime } from '../date-time'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatNum } from '@/lib/utils'
import * as m from '@/paraglide/messages'
import { DetailItem, DetailList } from '@/components/ui/detail-list'
import { useTokenUtil } from '@/hooks/useTokenUtil'
import { useAccount } from '@/hooks/useAccount'
import { useNativeBalance } from '@/hooks/useNativeBalance'

interface AccountOverviewProps {
  address: string
}

export function AccountOverview({ address }: AccountOverviewProps) {
  const {
    data: stats,
    isLoading: statsLoading,
    refetch,
  } = useAccount({ address })
  const nativeBalance = useNativeBalance(address)
  const { formatWei } = useTokenUtil()
  const isLoading = statsLoading || nativeBalance.isLoading
  const isVestingBalance = nativeBalance.data?.version === 'V2'

  const refresh = () => {
    void refetch()
    void nativeBalance.refetch()
  }

  const totalTxs =
    (stats?.totalTransactionsReceived ?? 0) +
    (stats?.totalTransactionsSent ?? 0)

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-base font-semibold flex items-center gap-2 justify-between">
          <div className="flex flex-row items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {m.address_overview()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')}
            />
            <span className="sr-only">{m.common_refresh()}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <DetailList>
          {/* Native Balance */}
          <DetailItem
            icon={Wallet}
            label={m.address_native_balance()}
            loading={isLoading}
          >
            <span className="font-mono">
              {formatWei(
                nativeBalance.data?.balance ?? stats?.balanceInNativeToken,
              )}
            </span>
          </DetailItem>

          {isVestingBalance && (
            <>
              <DetailItem
                icon={CircleDollarSign}
                label={m.address_spendable_balance()}
                loading={isLoading}
              >
                <span className="font-mono text-success">
                  {formatWei(nativeBalance.data?.spendableBalance)}
                </span>
              </DetailItem>
              <DetailItem
                icon={LockKeyhole}
                label={m.address_locked_mining_rewards()}
                loading={isLoading}
              >
                <span className="font-mono">
                  {formatWei(nativeBalance.data?.lockedMiningReward)}
                </span>
              </DetailItem>
              <DetailItem
                icon={Flame}
                label={m.address_pending_reward_cancellation()}
                loading={isLoading}
              >
                <span className="font-mono">
                  {formatWei(
                    nativeBalance.data?.pendingMiningRewardCancellation,
                  )}
                </span>
              </DetailItem>
            </>
          )}

          {/* Transactions */}
          <DetailItem
            icon={Activity}
            label={m.address_transactions()}
            loading={statsLoading}
          >
            <div className="flex items-center gap-3">
              <span>{formatNum(totalTxs)}</span>
              <span className="flex items-center gap-1 text-xs">
                <ArrowDownLeft className="h-3 w-3 text-success" />
                <span className="text-success">
                  {formatNum(stats?.totalTransactionsReceived)}
                </span>
              </span>
              <span className="flex items-center gap-1 text-xs">
                <ArrowUpRight className="h-3 w-3 text-destructive" />
                <span className="text-destructive">
                  {formatNum(stats?.totalTransactionsSent)}
                </span>
              </span>
            </div>
          </DetailItem>

          {/* Nonce */}
          <DetailItem
            icon={Hash}
            label={m.address_nonce()}
            loading={statsLoading}
          >
            <span>{formatNum(stats?.nonce)}</span>
          </DetailItem>

          {/* First Activity */}
          <DetailItem
            icon={Clock}
            label={m.address_first_activity()}
            loading={statsLoading}
          >
            <DateTime timestamp={stats?.firstActivity} mode="detail" />
          </DetailItem>

          {/* Last Activity */}
          <DetailItem
            icon={Clock}
            label={m.address_last_activity()}
            loading={statsLoading}
          >
            <DateTime timestamp={stats?.lastActivity} mode="detail" />
          </DetailItem>

          {/* Authority */}
          {stats?.authority && (
            <DetailItem
              icon={ShieldCheck}
              label={m.address_role()}
              loading={statsLoading}
            >
              <Badge>{m.address_authority()}</Badge>
            </DetailItem>
          )}
        </DetailList>
      </CardContent>
    </Card>
  )
}
