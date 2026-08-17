import { describe, expect, it } from 'vitest'
import { presentRewardVesting } from './reward-vesting'

describe('presentRewardVesting', () => {
  it('treats historical rewards without an unlock height as immediate', () => {
    expect(presentRewardVesting(null, 20)).toEqual({
      status: 'immediate',
      remainingBlocks: 0,
    })
  })

  it('keeps a reward locked one block before maturity', () => {
    expect(presentRewardVesting(31, 30)).toEqual({
      status: 'locked',
      remainingBlocks: 1,
    })
  })

  it('unlocks a reward exactly at its maturity height', () => {
    expect(presentRewardVesting(31, 31)).toEqual({
      status: 'unlocked',
      remainingBlocks: 0,
    })
  })
})
