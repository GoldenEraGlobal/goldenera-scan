import { queryOptions, useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { apiV1NetworkParamsGet } from '@/api/gen/clients/apiV1NetworkParamsGet'
import { apiV1ValidatorGetList } from '@/api/gen/clients/apiV1ValidatorGetList'
import { getClient } from '@/api/client'

export const getMiningEconomics = createServerFn().handler(async () => {
  try {
    const [validators, networkParams] = await Promise.all([
      apiV1ValidatorGetList({ client: getClient() }),
      apiV1NetworkParamsGet({ client: getClient() }),
    ])
    return { validators, networkParams }
  } catch {
    throw new Error('Failed to fetch validator mining economics')
  }
})

export const miningEconomicsQueryOptions = () =>
  queryOptions({
    queryKey: ['validators', 'mining-economics'],
    queryFn: getMiningEconomics,
  })

export function useValidators({
  autoRefetch = false,
}: { autoRefetch?: boolean } = {}) {
  return useQuery({
    ...miningEconomicsQueryOptions(),
    refetchInterval: autoRefetch ? 10_000 : false,
  })
}
