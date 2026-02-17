import { createFileRoute } from '@tanstack/react-router'
import * as m from "@/paraglide/messages"
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TxTable } from '@/components/tx/tx-table'
import { CopyButton } from '@/components/ui/copy-button'
import { formatNum, isZeroHash } from '@/lib/utils'
import { Box } from 'lucide-react'
import { blockQueryOptions, useBlock } from '@/hooks/useBlock'
import { BlockOverview } from '@/components/block/block-overview'

export const Route = createFileRoute('/_layout/block/$hash')({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      blockQueryOptions(params.hash),
    )
    return {
      block: data,
      APP_NAME: context.APP_NAME
    }
  },
  component: BlockDetailPage,
  head: ({ params, loaderData }) => ({
    meta: [
      { title: m.meta_title_block_detail({ height: params.hash, appName: loaderData?.APP_NAME || 'GoldenEra Scan' }) },
      {
        name: 'description',
        content: m.meta_description_block_detail({ height: params.hash, appName: loaderData?.APP_NAME || 'GoldenEra Scan' }),
      },
    ],
  })
})


function BlockDetailPage() {
  const { hash } = Route.useParams()
  const { data: block, isLoading: blockLoading } = useBlock({ hash })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Box className="h-4 w-4" />
          <span>{m.block_detail_block()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {blockLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <h1 className="text-xl md:text-2xl font-bold">
              #{formatNum(block?.height)}
            </h1>
          )}
          {block?.version && (
            <Badge variant="secondary" className="text-sm">
              {block.version}
            </Badge>
          )}
          {isZeroHash(block?.previousHash) && (
            <Badge variant="default" className="text-sm">
              {m.block_detail_genesis()}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-mono break-all">{hash}</span>
          <CopyButton value={hash} size="md" />
        </div>
      </div>

      {/* Block Overview Card */}
      <BlockOverview hash={hash} />

      {/* Block Transactions */}
      <TxTable
        blockHash={hash}
        title={m.block_detail_transactions_title()}
        pageSize={15}
      />
    </div>
  )
}

