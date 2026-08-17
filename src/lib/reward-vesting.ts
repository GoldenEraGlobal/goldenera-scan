export type RewardVestingStatus = 'immediate' | 'locked' | 'unlocked'

export interface RewardVestingPresentation {
  status: RewardVestingStatus
  remainingBlocks: number
}

export function presentRewardVesting(
  unlockBlockHeight: number | null | undefined,
  headHeight: number | null | undefined,
): RewardVestingPresentation {
  if (unlockBlockHeight == null) {
    return { status: 'immediate', remainingBlocks: 0 }
  }

  if (headHeight == null) {
    return { status: 'locked', remainingBlocks: 0 }
  }

  const remainingBlocks = Math.max(0, unlockBlockHeight - headHeight)
  return {
    status: remainingBlocks === 0 ? 'unlocked' : 'locked',
    remainingBlocks,
  }
}
