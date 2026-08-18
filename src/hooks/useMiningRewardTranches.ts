import { queryOptions, useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1TransferGetPage } from '@/api/gen/clients/apiV1TransferGetPage'

const MiningRewardTranchesSchema = z.object({
  address: z.string().min(1),
  pageSize: z.number().int().min(1).max(100).default(10),
})

export const getMiningRewardTranches = createServerFn()
  .inputValidator(MiningRewardTranchesSchema)
  .handler(async ({ data }) =>
    apiV1TransferGetPage(
      {
        pageNumber: 0,
        pageSize: data.pageSize,
        direction: 'DESC',
        type: 'BLOCK_REWARD',
        to: data.address,
      },
      { client: getClient() },
    ),
  )

export const miningRewardTranchesQueryOptions = (
  address: string,
  pageSize = 10,
) =>
  queryOptions({
    queryKey: ['account', address, 'mining-reward-tranches', pageSize],
    queryFn: () => getMiningRewardTranches({ data: { address, pageSize } }),
  })

export function useMiningRewardTranches(address: string, pageSize = 10) {
  return useQuery(miningRewardTranchesQueryOptions(address, pageSize))
}
