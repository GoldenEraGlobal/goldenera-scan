import {
  CheckCircle2,
  Clock3,
  Gauge,
  RefreshCw,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'
import type { ValidatorDtoV1 } from '@/api/gen'
import { useValidators } from '@/hooks/useValidators'
import { presentMiningPolicy } from '@/lib/mining-economics'
import { formatNum, cn } from '@/lib/utils'
import { AddressLink, HashLink } from '@/components/links'
import { DateTime } from '@/components/date-time'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import * as m from '@/paraglide/messages'

const value = (number: number | null | undefined) =>
  number == null ? '—' : formatNum(number)

function ValidatorCard({ validator }: { validator: ValidatorDtoV1 }) {
  const policy = presentMiningPolicy(validator)
  const modeLabel =
    policy.mode === 'UNLIMITED'
      ? m.validators_mode_unlimited()
      : policy.mode === 'LIMITED'
        ? m.validators_mode_limited()
        : m.common_na()
  const sourceLabel =
    policy.source === 'LEGACY_DEFAULT'
      ? m.validators_source_legacy()
      : policy.source === 'EXPLICIT'
        ? m.validators_source_explicit()
        : m.common_na()

  return (
    <Card size="sm">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AddressLink address={validator.address} className="text-sm" />
          <div className="flex gap-2">
            <Badge
              className={
                policy.mode === 'UNLIMITED'
                  ? 'bg-emerald-600 text-white'
                  : undefined
              }
              variant={policy.mode === 'LIMITED' ? 'secondary' : 'outline'}
            >
              {modeLabel}
            </Badge>
            <Badge variant="outline">{sourceLabel}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">
            {m.validators_share()}
          </p>
          <p className="font-semibold">
            {policy.mode === 'UNLIMITED'
              ? m.validators_not_limited()
              : (policy.sharePercent ?? '—')}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {m.validators_window_usage()}
          </p>
          <p className="font-semibold">
            {policy.mode === 'LIMITED'
              ? m.validators_usage_value({
                  mined: value(policy.mined),
                  quota: value(policy.quota),
                })
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {m.validators_remaining()}
          </p>
          <p className="font-semibold">{value(policy.remaining)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {m.validators_eligible()}
          </p>
          <p
            className={cn(
              'flex items-center gap-1.5 font-semibold',
              policy.eligible === true && 'text-emerald-600',
              policy.eligible === false && 'text-destructive',
            )}
          >
            {policy.eligible === true ? (
              <CheckCircle2 className="size-4" />
            ) : policy.eligible === false ? (
              <ShieldX className="size-4" />
            ) : null}
            {policy.eligible === true
              ? m.validators_eligible_yes()
              : policy.eligible === false
                ? m.validators_eligible_no()
                : m.common_na()}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-muted-foreground">
            {m.validators_policy_tx()}
          </p>
          {validator.policyUpdatedByTxHash ? (
            <HashLink
              hash={validator.policyUpdatedByTxHash}
              type="tx"
              className="text-xs"
            />
          ) : (
            <span>—</span>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {m.validators_policy_height()}
          </p>
          <p>#{value(validator.policyUpdatedAtBlockHeight)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {m.validators_policy_time()}
          </p>
          <DateTime timestamp={validator.policyUpdatedAtTimestamp} />
        </div>
      </CardContent>
    </Card>
  )
}

export function ValidatorsOverview() {
  const { data, isLoading, isRefetching, refetch } = useValidators({
    autoRefetch: true,
  })
  const params = data?.networkParams
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="size-4 text-primary" />
                {m.validators_network_title()}
              </CardTitle>
              <CardDescription>{m.validators_canonical_note()}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw
                className={cn('size-4', isRefetching && 'animate-spin')}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {m.validators_window()}
            </p>
            <p className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                value(params?.validatorMiningWindowBlocks)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {m.validators_unlimited_count()}
            </p>
            <p className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                value(params?.currentUnlimitedValidatorCount)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {m.validators_total_count()}
            </p>
            <p className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                value(params?.currentValidatorCount)
              )}
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{m.validators_list_title()}</h2>
      </div>
      {isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : data?.validators.length ? (
        <div className="grid gap-4">
          {data.validators.map((validator, index) => (
            <ValidatorCard
              key={validator.address ?? index}
              validator={validator}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-muted-foreground">
            <Clock3 className="mb-2 size-8" />
            <p>{m.validators_empty()}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
