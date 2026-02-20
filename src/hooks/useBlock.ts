
import { useQuery } from '@tanstack/react-query'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1BlockGetByHash } from '@/api/gen/clients/apiV1BlockGetByHash'
import { queryOptions } from '@tanstack/react-query'

const BlockSchema = z.object({
    hash: z.string().min(1),
})

export const getBlock = createServerFn()
    .inputValidator(BlockSchema)
    .handler(async ({ data }) => {
        try {
            return await apiV1BlockGetByHash(data.hash, { client: getClient() })
        } catch (e) {
            throw notFound()
        }
    })

export const blockQueryOptions = (hash: string) =>
    queryOptions({
        queryKey: ["block", hash],
        queryFn: () => getBlock({ data: { hash } }),
    })

export interface UseBlockProps {
    hash: string
    autoRefetch?: boolean
}

export function useBlock({ hash, autoRefetch = false }: UseBlockProps) {
    return useQuery({
        ...blockQueryOptions(hash),
        refetchInterval: autoRefetch ? 10000 : false,
    })
}
