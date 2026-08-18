import type { ValidatorDtoV1 } from '@/api/gen'

export type MiningPolicyPresentation = {
  mode: 'UNLIMITED' | 'LIMITED' | 'UNKNOWN'
  sharePercent: string | null
  source: 'LEGACY_DEFAULT' | 'EXPLICIT' | 'UNKNOWN'
  quota: number | null
  mined: number | null
  remaining: number | null
  eligible: boolean | null
}

const finiteNonNegative = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null

export function formatMiningShareBps(
  value: number | null | undefined,
  locale = 'en-US',
): string | null {
  const bps = finiteNonNegative(value)
  if (bps === null || bps > 10_000) return null
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(bps / 10_000)
}

export function presentMiningPolicy(
  validator: ValidatorDtoV1,
  locale = 'en-US',
): MiningPolicyPresentation {
  const mode =
    validator.miningLimitMode === 'UNLIMITED' ||
    validator.miningLimitMode === 'LIMITED'
      ? validator.miningLimitMode
      : 'UNKNOWN'
  const source =
    validator.miningPolicySource === 'LEGACY_DEFAULT' ||
    validator.miningPolicySource === 'EXPLICIT'
      ? validator.miningPolicySource
      : 'UNKNOWN'

  return {
    mode,
    // UNLIMITED uses a zero BPS sentinel. It must never be presented as a zero allowance.
    sharePercent:
      mode === 'LIMITED'
        ? formatMiningShareBps(validator.maxMiningShareBps, locale)
        : null,
    source,
    quota:
      mode === 'LIMITED'
        ? finiteNonNegative(validator.maxBlocksInCurrentWindow)
        : null,
    mined: finiteNonNegative(validator.blocksMinedInCurrentWindow),
    remaining:
      mode === 'LIMITED'
        ? finiteNonNegative(validator.remainingBlocksInCurrentWindow)
        : null,
    eligible:
      typeof validator.miningEligible === 'boolean'
        ? validator.miningEligible
        : null,
  }
}
