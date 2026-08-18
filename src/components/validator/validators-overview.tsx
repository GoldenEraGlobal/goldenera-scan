import {
  AlertTriangle,
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
import { cn } from '@/lib/utils'
import { AddressLink, HashLink } from '@/components/links'
import { DateTime } from '@/components/date-time'
import { getLocale } from '@/paraglide/runtime'
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

const value = (number: number | null | undefined, locale: string) =>
  number == null ? '—' : new Intl.NumberFormat(locale).format(number)

function ValidatorCard({
  validator,
  snapshotCurrent,
  locale,
}: {
  validator: ValidatorDtoV1
  snapshotCurrent: boolean
  locale: string
}) {
  const policy = presentMiningPolicy(validator, locale)
  const eligible = snapshotCurrent ? policy.eligible : null
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
                  mined: value(policy.mined, locale),
                  quota: value(policy.quota, locale),
                })
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {m.validators_remaining()}
          </p>
          <p className="font-semibold">{value(policy.remaining, locale)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {m.validators_eligible()}
          </p>
          <p
            className={cn(
              'flex items-center gap-1.5 font-semibold',
              eligible === true && 'text-emerald-600',
              eligible === false && 'text-destructive',
            )}
          >
            {eligible === true ? (
              <CheckCircle2 className="size-4" />
            ) : eligible === false ? (
              <ShieldX className="size-4" />
            ) : null}
            {!snapshotCurrent
              ? m.validators_eligible_stale()
              : eligible === true
                ? m.validators_eligible_yes()
                : eligible === false
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
          <p>#{value(validator.policyUpdatedAtBlockHeight, locale)}</p>
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
  const {
    data,
    dataUpdatedAt,
    isError,
    isLoading,
    isRefetchError,
    isRefetching,
    isStale,
    refetch,
  } = useValidators({ autoRefetch: true })
  const locale = getLocale()
  const queryFailed = isError || isRefetchError
  const snapshotCurrent = Boolean(data) && !queryFailed && !isStale
  const params = data?.networkParams
  return (
    <div className="space-y-6">
      {queryFailed || (data && isStale) ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p>
            {queryFailed
              ? data
                ? m.validators_refresh_failed()
                : m.validators_load_failed()
              : m.validators_snapshot_stale()}
          </p>
        </div>
      ) : null}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="size-4 text-primary" />
                {m.validators_network_title()}
              </CardTitle>
              <CardDescription>{m.validators_canonical_note()}</CardDescription>
              {data ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.validators_snapshot_head({
                    height: value(data.headHeight, locale),
                    hash: `${data.headHash.slice(0, 10)}…${data.headHash.slice(-8)}`,
                  })}
                </p>
              ) : null}
              {dataUpdatedAt > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.validators_last_updated({
                    time: new Intl.DateTimeFormat(locale, {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    }).format(new Date(dataUpdatedAt)),
                  })}
                </p>
              ) : null}
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
        <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {m.validators_window()}
            </p>
            <p className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                value(params?.validatorMiningWindowBlocks, locale)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {m.validators_reward_vesting()}
            </p>
            <p className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                value(params?.miningRewardVestingBlocks, locale)
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
                value(params?.currentUnlimitedValidatorCount, locale)
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
                value(params?.currentValidatorCount, locale)
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
              snapshotCurrent={snapshotCurrent}
              locale={locale}
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
