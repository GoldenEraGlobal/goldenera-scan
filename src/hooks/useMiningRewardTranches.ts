import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1TransferGetPage } from '@/api/gen/clients/apiV1TransferGetPage'

const MiningRewardTranchesSchema = z.object({
  address: z.string().min(1),
  page: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100).default(10),
})

export const getMiningRewardTranches = createServerFn()
  .inputValidator(MiningRewardTranchesSchema)
  .handler(async ({ data }) =>
    apiV1TransferGetPage(
      {
        pageNumber: data.page,
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
  page = 0,
  pageSize = 6,
) =>
  queryOptions({
    queryKey: ['account', address, 'mining-reward-tranches', page, pageSize],
    queryFn: () =>
      getMiningRewardTranches({ data: { address, page, pageSize } }),
    placeholderData: keepPreviousData,
  })

export function useMiningRewardTranches(
  address: string,
  page = 0,
  pageSize = 6,
) {
  return useQuery(miningRewardTranchesQueryOptions(address, page, pageSize))
}
