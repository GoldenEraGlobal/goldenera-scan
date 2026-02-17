import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { AccountOverview } from '@/components/account/account-overview'
import { TokenHoldingsTable } from '@/components/token/token-holdings-table'
import { TxTable } from '@/components/tx/tx-table'
import { CopyButton } from '@/components/ui/copy-button'
import {
  Wallet,
  ShieldCheck,
} from 'lucide-react'
import * as m from "@/paraglide/messages"
import { accountQueryOptions, useAccount } from '@/hooks/useAccount'

export const Route = createFileRoute('/_layout/account/$address')({
  component: AccountDetailPage,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      accountQueryOptions(params.address),
    )
    return {
      APP_NAME: context.APP_NAME,
    }
  },
  head: ({ params, loaderData }) => ({
    meta: [
      { title: m.meta_title_address_detail({ address: params.address, appName: loaderData?.APP_NAME || 'GoldenEra Scan' }) },
      {
        name: 'description',
        content: m.meta_description_address_detail({ address: params.address, appName: loaderData?.APP_NAME || 'GoldenEra Scan' }),
      },
    ],
  }),
})

function AccountDetailPage() {
  const { address } = Route.useParams()
  const { data: stats } = useAccount({ address })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Wallet className="h-4 w-4" />
          <span>{m.common_address()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-mono break-all">{address}</h1>
            <CopyButton value={address} size="md" />
          </div>
          {stats?.authority && (
            <Badge variant="default" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              {m.address_authority()}
            </Badge>
          )}
        </div>
      </div>

      {/* Unified Overview */}
      <AccountOverview address={address} />

      {/* Token Holdings Table */}
      <TokenHoldingsTable address={address} />

      {/* Transactions Table */}
      <TxTable
        address={address}
        showFilterTabs={true}
        title={m.address_transactions()}
        pageSize={15}
      />
    </div>
  )
}
