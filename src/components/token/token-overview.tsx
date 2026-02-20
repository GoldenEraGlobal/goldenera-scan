import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HashLink } from '@/components/links'
import {
    formatWei,
    isNativeToken,
    formatNum,
    cn,
} from '@/lib/utils'
import {
    Globe,
    Hash,
    Flame,
    ArrowUpRight,
    Clock,
    Activity,
    Layers,
    Coins,
    RefreshCw,
} from 'lucide-react'
import { useMemo } from 'react'
import * as m from "@/paraglide/messages"
import { DetailList, DetailItem } from '@/components/ui/detail-list'
import { DateTime } from '../date-time'
import { useTokenDetail } from '@/hooks/useTokenDetail'
import { useBlockByHeight } from '@/hooks/useBlockByHeight'
import { Button } from '../ui/button'

interface TokenOverviewProps {
    address: string
}

export function TokenOverview({ address }: TokenOverviewProps) {
    const { data: token, isLoading: tokenLoading, refetch } = useTokenDetail({ address })
    const { data: block, isLoading: blockLoading } = useBlockByHeight({ height: token?.createdAtBlockHeight })

    const symbol = token?.smallestUnitName ?? ''
    const decimals = token?.numberOfDecimals ?? 8
    const website = useMemo(() => token?.websiteUrl ? new URL(token.websiteUrl).hostname : null, [token?.websiteUrl])

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="text-base font-semibold flex items-center gap-2 justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        {m.tx_detail_overview()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={tokenLoading}
                        className="h-8"
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', tokenLoading && 'animate-spin')} />
                        <span className="sr-only">
                            {m.common_refresh()}
                        </span>
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <DetailList>
                    {/* Total Supply */}
                    <DetailItem icon={Layers} label={m.token_overview_total_supply()} loading={tokenLoading}>
                        <span className="font-mono">
                            {formatWei(token?.totalSupply, decimals)} {symbol}
                        </span>
                    </DetailItem>

                    {/* Max Supply */}
                    <DetailItem icon={Layers} label={m.token_overview_max_supply()} loading={tokenLoading}>
                        <span>
                            {token?.maxSupply
                                ? `${formatWei(token.maxSupply, decimals)} ${symbol}`
                                : m.common_unlimited()}
                        </span>
                    </DetailItem>

                    {/* Decimals */}
                    <DetailItem icon={Hash} label={m.token_overview_decimals()} loading={tokenLoading}>
                        <span className="font-mono">{formatNum(token?.numberOfDecimals)}</span>
                    </DetailItem>

                    {/* Burnable */}
                    <DetailItem icon={Flame} label={m.token_overview_user_burnable()} loading={tokenLoading}>
                        <Badge variant={token?.userBurnable ? 'default' : 'secondary'}>
                            {token?.userBurnable ? m.common_yes() : m.common_no()}
                        </Badge>
                    </DetailItem>

                    {/* Is native */}
                    <DetailItem icon={Coins} label={m.token_overview_is_native()} loading={tokenLoading}>
                        <Badge variant={isNativeToken(address) ? 'default' : 'secondary'}>
                            {isNativeToken(address) ? m.common_yes() : m.common_no()}
                        </Badge>
                    </DetailItem>

                    {/* Website */}
                    {token?.websiteUrl && (
                        <DetailItem icon={Globe} label={m.token_overview_website()} loading={tokenLoading}>
                            <a
                                href={token.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                                {website}
                                <ArrowUpRight className="h-3 w-3" />
                            </a>
                        </DetailItem>
                    )}

                    {/* Created At */}
                    <DetailItem icon={Clock} label={m.token_overview_created()} loading={tokenLoading}>
                        <DateTime timestamp={token?.createdAtTimestamp} mode="detail" />
                    </DetailItem>

                    {/* Last Updated */}
                    <DetailItem icon={Clock} label={m.common_last_updated()} loading={tokenLoading}>
                        <DateTime timestamp={token?.updatedAtTimestamp} mode="detail" />
                    </DetailItem>

                    {/* Block Height */}
                    <DetailItem icon={Layers} label={m.token_overview_created_at_block()} loading={tokenLoading || blockLoading}>
                        <HashLink hash={block?.hash ?? ''} type="block" />
                    </DetailItem>
                </DetailList>
            </CardContent>
        </Card>
    )
}
