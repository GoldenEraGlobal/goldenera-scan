import { queryOptions, useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { snapshot } from '@/api/gen/clients/snapshot'
import { getClient } from '@/api/client'

export const getMiningEconomics = createServerFn().handler(async () => {
  try {
    const data = await snapshot({ client: getClient() })
    if (
      typeof data.headHeight !== 'number' ||
      typeof data.headHash !== 'string' ||
      typeof data.capturedAt !== 'string' ||
      data.networkParams == null ||
      !Array.isArray(data.validators)
    ) {
      throw new Error('Incomplete mining economics snapshot')
    }
    return {
      headHeight: data.headHeight,
      headHash: data.headHash,
      capturedAt: data.capturedAt,
      networkParams: data.networkParams,
      validators: data.validators,
    }
  } catch {
    throw new Error('Failed to fetch validator mining economics')
  }
})

export const miningEconomicsQueryOptions = () =>
  queryOptions({
    queryKey: ['validators', 'mining-economics'],
    queryFn: getMiningEconomics,
    staleTime: 30_000,
  })

export function useValidators({
  autoRefetch = false,
}: { autoRefetch?: boolean } = {}) {
  return useQuery({
    ...miningEconomicsQueryOptions(),
    refetchInterval: autoRefetch ? 10_000 : false,
  })
}
