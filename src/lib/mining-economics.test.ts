import { describe, expect, it } from 'vitest'
import { formatMiningShareBps, presentMiningPolicy } from './mining-economics'

describe('mining economics presentation', () => {
  it('never presents the unlimited zero sentinel as zero permission', () => {
    expect(
      presentMiningPolicy({
        miningLimitMode: 'UNLIMITED',
        maxMiningShareBps: 0,
      }),
    ).toMatchObject({
      mode: 'UNLIMITED',
      sharePercent: null,
      quota: null,
      remaining: null,
    })
  })

  it('formats limited basis points and current quota', () => {
    expect(
      presentMiningPolicy({
        miningLimitMode: 'LIMITED',
        miningPolicySource: 'EXPLICIT',
        maxMiningShareBps: 1250,
        maxBlocksInCurrentWindow: 12,
        blocksMinedInCurrentWindow: 8,
        remainingBlocksInCurrentWindow: 4,
        miningEligible: true,
      }),
    ).toEqual({
      mode: 'LIMITED',
      source: 'EXPLICIT',
      sharePercent: '12.5%',
      quota: 12,
      mined: 8,
      remaining: 4,
      eligible: true,
    })
  })

  it('gracefully rejects absent and noncanonical values', () => {
    expect(formatMiningShareBps(10_001)).toBeNull()
    expect(
      presentMiningPolicy({
        maxBlocksInCurrentWindow: -1,
        miningEligible: null,
      }),
    ).toEqual({
      mode: 'UNKNOWN',
      source: 'UNKNOWN',
      sharePercent: null,
      quota: null,
      mined: null,
      remaining: null,
      eligible: null,
    })
  })
})
