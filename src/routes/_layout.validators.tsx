import { createFileRoute } from '@tanstack/react-router'
import { ShieldCheck } from 'lucide-react'
import { ValidatorsOverview } from '@/components/validator/validators-overview'
import { miningEconomicsQueryOptions } from '@/hooks/useValidators'
import * as m from '@/paraglide/messages'

export const Route = createFileRoute('/_layout/validators')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(miningEconomicsQueryOptions()),
  component: ValidatorsPage,
  head: () => ({
    meta: [
      { title: m.validators_meta_title() },
      { name: 'description', content: m.validators_meta_description() },
    ],
  }),
})

function ValidatorsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4" />
          {m.header_validators()}
        </div>
        <h1 className="text-xl font-bold md:text-2xl">
          {m.validators_page_title()}
        </h1>
        <p className="text-sm text-muted-foreground">
          {m.validators_page_subtitle()}
        </p>
      </div>
      <ValidatorsOverview />
    </div>
  )
}
