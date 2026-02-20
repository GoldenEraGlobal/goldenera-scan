import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatNum } from '@/lib/utils'
import {
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    Hash,
    Activity,
    ShieldCheck,
    RefreshCw
} from 'lucide-react'
import { Badge } from '../ui/badge'
import * as m from "@/paraglide/messages"
import { DetailList, DetailItem } from '@/components/ui/detail-list'
import { useTokenUtil } from '@/hooks/useTokenUtil'
import { DateTime } from '../date-time'
import { useAccount } from '@/hooks/useAccount'
import { Button } from '../ui/button'

interface AccountOverviewProps {
    address: string
}

export function AccountOverview({ address }: AccountOverviewProps) {
    const { data: stats, isLoading: statsLoading, refetch } = useAccount({ address })
    const { formatWei } = useTokenUtil()

    const totalTxs =
        (stats?.totalTransactionsReceived ?? 0) + (stats?.totalTransactionsSent ?? 0)

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
                        onClick={() => refetch()}
                        disabled={statsLoading}
                        className="h-8"
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', statsLoading && 'animate-spin')} />
                        <span className="sr-only">
                            {m.common_refresh()}
                        </span>
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <DetailList>
                    {/* Native Balance */}
                    <DetailItem icon={Wallet} label={m.address_native_balance()} loading={statsLoading}>
                        <span className="font-mono">
                            {formatWei(stats?.balanceInNativeToken)}
                        </span>
                    </DetailItem>

                    {/* Transactions */}
                    <DetailItem icon={Activity} label={m.address_transactions()} loading={statsLoading}>
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
                    <DetailItem icon={Hash} label={m.address_nonce()} loading={statsLoading}>
                        <span>{formatNum(stats?.nonce)}</span>
                    </DetailItem>

                    {/* First Activity */}
                    <DetailItem icon={Clock} label={m.address_first_activity()} loading={statsLoading}>
                        <DateTime timestamp={stats?.firstActivity} mode="detail" />
                    </DetailItem>

                    {/* Last Activity */}
                    <DetailItem icon={Clock} label={m.address_last_activity()} loading={statsLoading}>
                        <DateTime timestamp={stats?.lastActivity} mode="detail" />
                    </DetailItem>

                    {/* Authority */}
                    {stats?.authority && (
                        <DetailItem icon={ShieldCheck} label={m.address_role()} loading={statsLoading}>
                            <Badge>
                                {m.address_authority()}
                            </Badge>
                        </DetailItem>
                    )}
                </DetailList>
            </CardContent>
        </Card>
    )
}
