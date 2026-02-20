import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddressLink, HashLink } from '@/components/links'
import * as m from "@/paraglide/messages"
import { useTokenUtil } from '@/hooks/useTokenUtil'
import { useTransaction } from '@/hooks/useTransaction'
import { DateTime } from '../date-time'
import { cn, formatNum, formatPayloadType, hexToUtf8, shortenAddress } from '@/lib/utils'
import { CopyButton } from '@/components/ui/copy-button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
    FileText,
    Hash,
    Clock,
    Layers,
    User,
    ArrowRight,
    Coins,
    Activity,
    MessageSquare,
    Fingerprint,
    Network,
    Box,
    ShieldCheck,
    RefreshCw,
} from 'lucide-react'
import { DetailList, DetailItem } from '@/components/ui/detail-list'
import { Button } from '../ui/button'

export function TxOverview({ hash }: { hash: string }) {
    const { data: tx, isLoading: txLoading, refetch } = useTransaction({ hash, autoRefetch: true })
    const { formatWei: formatAmount } = useTokenUtil({ tokenAddress: tx?.tokenAddress })
    const { formatWei: formatFee } = useTokenUtil({}) // Defaults to native

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="text-base font-semibold flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        {m.tx_detail_overview()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={txLoading}
                        className="h-8"
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', txLoading && 'animate-spin')} />
                        <span className="sr-only">
                            {m.common_refresh()}
                        </span>
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <DetailList>
                    {/* Tx Hash */}
                    <DetailItem icon={Hash} label={m.tx_detail_hash()} loading={txLoading}>
                        <HashLink hash={tx?.hash} type="tx" disabled />
                    </DetailItem>

                    {/* Block */}
                    <DetailItem icon={Box} label={m.tx_detail_block()} loading={txLoading}>
                        {tx?.blockHeight != null ? (
                            <div className="flex items-center gap-2">
                                <span className="font-mono">{formatNum(tx.blockHeight)}</span>
                                {tx.blockHash && (
                                    <HashLink hash={tx.blockHash} type="block" />
                                )}
                            </div>
                        ) : (
                            <Badge variant="outline" className="text-sm border-pending text-pending bg-pending/10 flex items-center gap-1.5 animate-pulse">
                                <Clock className="size-2" />
                                {m.common_pending()}
                            </Badge>
                        )}
                    </DetailItem>

                    {/* Confirmations */}
                    <DetailItem icon={ShieldCheck} label={m.tx_detail_confirmations()} loading={txLoading}>
                        {tx?.confirmations != null ? (
                            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                {m.tx_detail_confirmations_count({ count: tx.confirmations.toString() })}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                                {m.tx_detail_confirmations_count({ count: '0' })}
                            </Badge>
                        )}
                    </DetailItem>

                    <DetailItem icon={Clock} label={m.tx_detail_timestamp()} loading={txLoading}>
                        <DateTime timestamp={tx?.timestamp} mode="detail" />
                    </DetailItem>

                    {/* Sender */}
                    <DetailItem icon={User} label={m.tx_detail_from()} loading={txLoading}>
                        {tx?.sender ? (
                            <AddressLink address={tx.sender} />
                        ) : (
                            <span className="text-muted-foreground">{m.common_na()}</span>
                        )}
                    </DetailItem>

                    {/* Recipient */}
                    <DetailItem icon={ArrowRight} label={m.tx_detail_to()} loading={txLoading}>
                        {tx?.recipient ? (
                            <AddressLink address={tx.recipient} />
                        ) : (
                            <span className="text-muted-foreground">{m.common_na()}</span>
                        )}
                    </DetailItem>

                    {/* Amount */}
                    <DetailItem icon={Coins} label={m.tx_detail_amount()} loading={txLoading}>
                        <span className="font-mono">
                            {formatAmount(tx?.amount)}
                        </span>
                    </DetailItem>

                    {/* Fee */}
                    <DetailItem icon={Coins} label={m.tx_detail_fee()} loading={txLoading}>
                        <span className="font-mono">
                            {formatFee(tx?.fee)}
                        </span>
                    </DetailItem>

                    {/* Token Address */}
                    {!!tx?.tokenAddress && (
                        <DetailItem icon={Coins} label={m.tx_detail_token()} loading={txLoading}>
                            <AddressLink address={tx.tokenAddress} type="token" />
                        </DetailItem>
                    )}

                    {/* Nonce */}
                    <DetailItem icon={Fingerprint} label={m.tx_detail_nonce()} loading={txLoading}>
                        <span className="font-mono">{formatNum(tx?.nonce)}</span>
                    </DetailItem>

                    {/* Index in Block */}
                    {tx?.index != null && (
                        <DetailItem icon={Layers} label={m.tx_detail_index_in_block()} loading={txLoading}>
                            <span className="font-mono">{formatNum(tx.index)}</span>
                        </DetailItem>
                    )}

                    {/* Size */}
                    {tx?.size != null && (
                        <DetailItem icon={Box} label={m.tx_detail_size()} loading={txLoading}>
                            <span className="font-mono">{m.tx_detail_size_bytes({ count: formatNum(tx.size) })}</span>
                        </DetailItem>
                    )}

                    {/* Network */}
                    <DetailItem icon={Network} label={m.tx_detail_network()} loading={txLoading}>
                        <Badge variant="outline">{tx?.network ?? m.common_na()}</Badge>
                    </DetailItem>

                    {/* Version */}
                    <DetailItem icon={Layers} label={m.tx_detail_version()} loading={txLoading}>
                        <span>{tx?.version ?? m.common_na()}</span>
                    </DetailItem>

                    {/* Payload Type */}
                    {tx?.payloadType && (
                        <DetailItem icon={FileText} label={m.tx_detail_payload_type()} loading={txLoading}>
                            <Badge variant="secondary">
                                {formatPayloadType(tx.payloadType)}
                            </Badge>
                        </DetailItem>
                    )}
                </DetailList>

                {/* Message */}
                {tx?.message && (
                    <div className="mt-6 pt-6 border-t">
                        <DetailItem icon={MessageSquare} label={m.tx_detail_message()} loading={txLoading}>
                            <div className="bg-muted/50 rounded-lg p-4">
                                {(() => {
                                    const utf8 = hexToUtf8(tx.message)
                                    if (utf8) {
                                        return (
                                            <div className="flex flex-col gap-3">
                                                <div className="text-sm font-sans break-all leading-relaxed">
                                                    {utf8}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground pt-3 border-t border-muted-foreground/10">
                                                    <Tooltip>
                                                        <TooltipTrigger
                                                            render={
                                                                <div className="font-mono text-[10px] cursor-help" />
                                                            }
                                                        >
                                                            {shortenAddress(tx.message, 20, 20)}
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-md break-all font-mono text-[10px]">
                                                            {tx.message}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <CopyButton value={tx.message} size="sm" />
                                                </div>
                                            </div>
                                        )
                                    }
                                    return (
                                        <div className="flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger
                                                    render={
                                                        <div className="font-mono text-xs cursor-help" />
                                                    }
                                                >
                                                    {shortenAddress(tx.message, 24, 24)}
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-md break-all font-mono text-xs">
                                                    {tx.message}
                                                </TooltipContent>
                                            </Tooltip>
                                            <CopyButton value={tx.message} size="sm" />
                                        </div>
                                    )
                                })()}
                            </div>
                        </DetailItem>
                    </div>
                )}

                {/* Reference Hash */}
                {tx?.referenceHash && (
                    <div className="mt-6 pt-6 border-t">
                        <DetailItem icon={Hash} label={m.tx_detail_reference_hash()} loading={txLoading}>
                            <HashLink hash={tx.referenceHash} type="tx" />
                        </DetailItem>
                    </div>
                )}

                {/* Signature */}
                {tx?.signature && (
                    <div className="mt-6 pt-6 border-t">
                        <DetailItem icon={Fingerprint} label={m.tx_detail_signature()} loading={txLoading}>
                            <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs break-all">
                                {tx.signature}
                            </div>
                        </DetailItem>
                    </div>
                )}

                {/* Payload */}
                {tx?.payload && (
                    <div className="mt-6 pt-6 border-t">
                        <DetailItem icon={FileText} label={m.tx_detail_payload()} loading={txLoading}>
                            <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs break-all whitespace-pre-wrap">
                                {JSON.stringify(tx.payload, null, 2)}
                            </div>
                        </DetailItem>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
