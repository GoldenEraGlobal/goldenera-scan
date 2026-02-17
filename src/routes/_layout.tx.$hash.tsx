import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import * as m from "@/paraglide/messages"
import { CopyButton } from '@/components/ui/copy-button'
import {
  FileText,
  Clock,
  Box,
} from 'lucide-react'
import { useTransaction, transactionQueryOptions } from '@/hooks/useTransaction'
import { TxOverview } from '@/components/tx/tx-overview'
import { notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/tx/$hash')({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      transactionQueryOptions(params.hash),
    )

    if (!data) {
      throw notFound({
        routeId: '__root__'
      })
    }

    return {
      tx: data,
      APP_NAME: context.APP_NAME
    }
  },
  component: TxDetailPage,
  head: ({ params, loaderData }) => ({
    meta: [
      { title: m.meta_title_tx_detail({ hash: params.hash, appName: loaderData?.APP_NAME || 'GoldenEra Scan' }) },
      {
        name: 'description',
        content: m.meta_description_tx_detail({ hash: params.hash, appName: loaderData?.APP_NAME || 'GoldenEra Scan' }),
      },
    ],
  }),
})

function TxDetailPage() {
  const { hash } = Route.useParams()
  const { data: tx, isLoading: txLoading } = useTransaction({ hash })
  const txType = tx?.type ?? 'TRANSFER'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <FileText className="h-4 w-4" />
          <span>{m.tx_detail_title()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {txLoading ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              <h1 className="text-xl md:text-2xl font-bold font-mono break-all">{hash}</h1>
            )}
            <CopyButton value={hash} size="md" />
          </div>
          {tx?.type && (
            <Badge variant="secondary" className="text-sm">
              {txType}
            </Badge>
          )}
          {tx?.isPending ? (
            <Badge variant="outline" className="text-sm border-pending text-pending bg-pending/10 flex items-center gap-1.5 animate-pulse">
              <Clock className="size-3" />
              {m.common_pending()}
            </Badge>
          ) : tx ? (
            <Badge variant="outline" className="text-sm border-success text-success bg-success/10 flex items-center gap-1.5">
              <Box className="size-3" />
              {m.common_confirmed()}
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Transaction Overview Card */}
      <TxOverview hash={hash} />
    </div>
  )
}

