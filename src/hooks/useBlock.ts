
import { useQuery } from '@tanstack/react-query'
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
            return null
        }
    })

export const blockQueryOptions = (hash: string) =>
    queryOptions({
        queryKey: ["block", hash],
        queryFn: () => getBlock({ data: { hash } }),
    })

export interface UseBlockProps {
    hash: string
}

export function useBlock({ hash }: UseBlockProps) {
    return useQuery(blockQueryOptions(hash))
}
