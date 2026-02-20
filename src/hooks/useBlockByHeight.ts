
import { useQuery } from '@tanstack/react-query'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1BlockGetByHeight } from '@/api/gen/clients/apiV1BlockGetByHeight'
import { queryOptions } from '@tanstack/react-query'

const BlockHeightSchema = z.object({
    height: z.number(),
})

export const getBlockByHeight = createServerFn()
    .inputValidator(BlockHeightSchema)
    .handler(async ({ data }) => {
        try {
            return await apiV1BlockGetByHeight(data.height, { client: getClient() })
        } catch (e) {
            throw notFound()
        }
    })

export const blockByHeightQueryOptions = (height: number) =>
    queryOptions({
        queryKey: ["block-by-height", height],
        queryFn: () => getBlockByHeight({ data: { height } }),
    })

export interface UseBlockByHeightProps {
    height?: number
    autoRefetch?: boolean
}

export function useBlockByHeight({ height, autoRefetch = false }: UseBlockByHeightProps) {
    return useQuery({
        ...blockByHeightQueryOptions(height ?? 0),
        enabled: typeof height === 'number',
        refetchInterval: autoRefetch ? 10000 : false,
    })
}
