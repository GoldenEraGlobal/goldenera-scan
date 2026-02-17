import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TokenOverview } from '@/components/token/token-overview'
import { TokenHoldersTable } from '@/components/token/token-holders-table'
import { TxTable } from '@/components/tx/tx-table'
import { CopyButton } from '@/components/ui/copy-button'
import { Coins } from 'lucide-react'
import { isNativeToken } from '@/lib/utils'
import * as m from "@/paraglide/messages"
import { tokenQueryOptions, useTokenDetail } from '@/hooks/useTokenDetail'

export const Route = createFileRoute('/_layout/token/$address')({
    component: TokenDetailPage,
    loader: async ({ context, params }) => {
        await context.queryClient.ensureQueryData(
            tokenQueryOptions(params.address),
        )
    },
    head: ({ params }) => ({
        meta: [
            { title: m.meta_title_token_detail({ name: params.address, appName: import.meta.env.VITE_APP_NAME || 'GE Explorer' }) },
            {
                name: 'description',
                content: m.meta_description_token_detail({ name: params.address, appName: import.meta.env.VITE_APP_NAME || 'GE Explorer' }),
            },
        ],
    }),
})

function TokenDetailPage() {
    const { address } = Route.useParams()

    const { data: token, isLoading: tokenLoading } = useTokenDetail({ address })

    const name = token?.name ?? m.common_unknown_token()
    const symbol = token?.smallestUnitName ?? ''

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Coins className="h-4 w-4" />
                    <span>{m.common_token()}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {tokenLoading ? (
                        <Skeleton className="h-10 w-10 rounded-full" />
                    ) : (
                        <Avatar>
                            {token?.logoUrl ? (
                                <AvatarImage src={token.logoUrl} alt={name} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            {tokenLoading ? (
                                <Skeleton className="h-8 w-48" />
                            ) : (
                                <h1 className="text-xl md:text-2xl font-bold">{name}</h1>
                            )}
                            {symbol && (
                                <Badge variant="secondary" className="text-sm">
                                    {symbol}
                                </Badge>
                            )}
                            {isNativeToken(address) && (
                                <Badge variant="default" className="text-sm">
                                    {m.common_native()}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground font-mono break-all">{address}</span>
                            <CopyButton value={address} size="md" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Token Overview Card */}
            <TokenOverview address={address} />

            {/* Holders Table */}
            <TokenHoldersTable tokenAddress={address} />

            {/* Token Transfers */}
            <TxTable
                tokenAddress={address}
                title={m.token_transactions_title()}
                pageSize={15}
            />
        </div>
    )
}
