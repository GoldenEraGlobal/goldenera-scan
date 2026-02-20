
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1BlockGetPage } from '@/api/gen/clients/apiV1BlockGetPage'
import { queryOptions } from '@tanstack/react-query'

const BlocksSchema = z.object({
    page: z.number(),
    pageSize: z.number().optional(),
    coinbase: z.string().optional(),
    direction: z.enum(['ASC', 'DESC']).optional(),
})

export const getBlocks = createServerFn()
    .inputValidator(BlocksSchema)
    .handler(async ({ data }) => {
        try {
            const res = await apiV1BlockGetPage(
                {
                    pageNumber: data.page,
                    pageSize: data.pageSize ?? 25,
                    direction: data.direction ?? 'DESC',
                    coinbase: data.coinbase,
                },
                { client: getClient() }
            )
            return {
                list: res.list || [],
                totalPages: res.totalPages || 1,
                totalElements: res.totalElements || 0,
            }
        } catch (e) {
            throw new Error("Failed to fetch blocks")
        }
    })

export interface UseBlocksProps {
    coinbase?: string
    page: number
    pageSize?: number
    direction?: 'ASC' | 'DESC'
    autoRefetch?: boolean
}

export const blocksQueryOptions = (props: Omit<UseBlocksProps, 'autoRefetch'>) => {
    const { pageSize = 25, direction = 'DESC' } = props
    return queryOptions({
        queryKey: ['blocks', { ...props, pageSize, direction }],
        queryFn: () => getBlocks({ data: { ...props, pageSize, direction } }),
        placeholderData: keepPreviousData,
    })
}

export function useBlocks(props: UseBlocksProps) {
    const { autoRefetch = false, ...queryProps } = props
    return useQuery({
        ...blocksQueryOptions(queryProps),
        refetchInterval: autoRefetch ? 10000 : false,
    })
}
