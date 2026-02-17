import { createFileRoute } from '@tanstack/react-router'
import { TxTable } from '@/components/tx/tx-table'
import { ArrowRightLeft } from 'lucide-react'
import * as m from "@/paraglide/messages"

export const Route = createFileRoute('/_layout/transactions')({
  component: TransactionsPage,
  loader: ({ context }) => {
    const { APP_NAME } = context

    return {
      APP_NAME
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: m.meta_title_transactions({ appName: loaderData?.APP_NAME || 'GoldenEra Scan' }) },
      {
        name: 'description',
        content: m.meta_description_transactions({ appName: loaderData?.APP_NAME || 'GoldenEra Scan' }),
      },
    ],
  }),
})

function TransactionsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <ArrowRightLeft className="h-4 w-4" />
          <span>{m.header_transactions()}</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold">{m.address_all_transactions()}</h1>
        <p className="text-sm text-muted-foreground">
          {m.address_view_all_transactions()}
        </p>
      </div>

      {/* Transactions Table */}
      <TxTable
        title={m.address_all_transactions()}
        pageSize={25}
      />
    </div>
  )
}
