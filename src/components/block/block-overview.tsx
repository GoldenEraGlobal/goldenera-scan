
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddressLink, HashLink } from '@/components/links'
import {
    formatNum,
} from '@/lib/utils'
import {
    Hash,
    Clock,
    Layers,
    Activity,
    Fingerprint,
    User,
    Coins,
    ArrowLeft,
    FileText,
    Shield,
} from 'lucide-react'
import * as m from "@/paraglide/messages"
import { useBlock } from '@/hooks/useBlock'
import { useTokenUtil } from '@/hooks/useTokenUtil'
import { DateTime } from '../date-time'
import { DetailList, DetailItem } from '@/components/ui/detail-list'

interface BlockOverviewProps {
    hash: string
}

export function BlockOverview({ hash }: BlockOverviewProps) {
    const { data: block, isLoading: blockLoading } = useBlock({ hash })
    const { formatWei } = useTokenUtil()

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    {m.block_detail_overview()}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <DetailList>
                    {/* Block Height */}
                    <DetailItem icon={Layers} label={m.block_detail_height()} loading={blockLoading}>
                        <span className="font-mono">{formatNum(block?.height)}</span>
                    </DetailItem>

                    {/* Timestamp */}
                    <DetailItem icon={Clock} label={m.block_detail_timestamp()} loading={blockLoading}>
                        <DateTime timestamp={block?.timestamp} mode="detail" />
                    </DetailItem>

                    {/* Transactions */}
                    <DetailItem icon={FileText} label={m.block_detail_transactions()} loading={blockLoading}>
                        <span className="font-mono">{formatNum(block?.numberOfTxs)}</span>
                    </DetailItem>

                    {/* Coinbase / Miner */}
                    <DetailItem icon={User} label={m.block_detail_coinbase()} loading={blockLoading}>
                        {block?.coinbase ? (
                            <AddressLink address={block.coinbase} />
                        ) : (
                            <span className="text-muted-foreground">N/A</span>
                        )}
                    </DetailItem>

                    {/* Block Reward */}
                    <DetailItem icon={Coins} label={m.block_detail_reward()} loading={blockLoading}>
                        <span className="font-mono">
                            {formatWei(block?.blockReward)}
                        </span>
                    </DetailItem>

                    {/* Total Fees */}
                    <DetailItem icon={Coins} label={m.block_detail_fees()} loading={blockLoading}>
                        <span className="font-mono">
                            {formatWei(block?.totalFees)}
                        </span>
                    </DetailItem>

                    {/* Difficulty */}
                    <DetailItem icon={Shield} label={m.block_detail_difficulty()} loading={blockLoading}>
                        <span className="font-mono">{formatNum(block?.difficulty)}</span>
                    </DetailItem>

                    {/* Nonce */}
                    <DetailItem icon={Fingerprint} label={m.block_detail_nonce()} loading={blockLoading}>
                        <span className="font-mono">{formatNum(block?.nonce)}</span>
                    </DetailItem>

                    {/* Identity */}
                    {block?.identity && (
                        <DetailItem icon={User} label={m.block_detail_identity()} loading={blockLoading}>
                            <AddressLink address={block.identity} />
                        </DetailItem>
                    )}
                </DetailList>

                {/* Hashes Section */}
                <div className="mt-6 pt-6 border-t space-y-6">
                    {/* Block Hash */}
                    <DetailItem icon={Hash} label={m.block_detail_hash()} loading={blockLoading}>
                        <HashLink hash={block?.hash ?? ''} type="block" disabled />
                    </DetailItem>

                    {/* Previous Block Hash */}
                    <DetailItem icon={ArrowLeft} label={m.block_detail_previous_hash()} loading={blockLoading}>
                        {block?.previousHash ? (
                            <HashLink hash={block.previousHash} type="block" />
                        ) : (
                            <span className="text-muted-foreground">{m.block_detail_genesis_block()}</span>
                        )}
                    </DetailItem>

                    {/* Tx Root Hash */}
                    {block?.txRootHash && (
                        <DetailItem icon={Hash} label={m.block_detail_transactions_root()} loading={blockLoading}>
                            <HashLink hash={block.txRootHash} type="unknown" disabled />
                        </DetailItem>
                    )}

                    {/* State Root Hash */}
                    {block?.stateRootHash && (
                        <DetailItem icon={Hash} label={m.block_detail_state_root()} loading={blockLoading}>
                            <HashLink hash={block.stateRootHash} type="unknown" disabled />
                        </DetailItem>
                    )}

                    {/* Cumulative Difficulty */}
                    {block?.cumulativeDifficulty && (
                        <DetailItem icon={Shield} label={m.block_detail_cumulative_difficulty()} loading={blockLoading}>
                            <span className="font-mono">{formatNum(block.cumulativeDifficulty)}</span>
                        </DetailItem>
                    )}
                </div>

                {/* Signature */}
                {block?.signature && (
                    <div className="mt-6 pt-6 border-t">
                        <DetailItem icon={Fingerprint} label={m.block_detail_signature()} loading={blockLoading}>
                            <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs break-all">
                                {block.signature}
                            </div>
                        </DetailItem>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
