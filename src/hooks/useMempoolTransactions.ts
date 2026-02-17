
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1MemTransferGetPage } from '@/api/gen/clients/apiV1MemTransferGetPage'
import { queryOptions } from '@tanstack/react-query'

const MempoolSchema = z.object({
    address: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    tokenAddress: z.string().optional(),
    transferType: z.string().optional(),
    page: z.number(),
    pageSize: z.number().optional(),
    direction: z.enum(['ASC', 'DESC']).optional(),
})

export const getMempoolTransfers = createServerFn()
    .inputValidator(MempoolSchema)
    .handler(async ({ data }) => {
        try {
            const queryParams: Record<string, unknown> = {
                pageNumber: data.page,
                pageSize: data.pageSize ?? 25,
                direction: data.direction ?? 'DESC',
            }

            if (data.address) queryParams.address = data.address
            if (data.from) queryParams.from = data.from
            if (data.to) queryParams.to = data.to
            if (data.tokenAddress) queryParams.tokenAddress = data.tokenAddress
            if (data.transferType) queryParams.transferType = data.transferType

            const res = await apiV1MemTransferGetPage(queryParams as any, { client: getClient() })
            return {
                list: res.list || [],
                totalPages: res.totalPages || 1,
                totalElements: res.totalElements || 0,
            }
        } catch (e) {
            return { list: [], totalPages: 1, totalElements: 0 }
        }
    })

export interface UseMempoolTransactionsProps {
    address?: string
    from?: string
    to?: string
    tokenAddress?: string
    transferType?: string
    page: number
    pageSize?: number
    direction?: 'ASC' | 'DESC'
}

export const mempoolTransactionsQueryOptions = (props: UseMempoolTransactionsProps) => {
    const { pageSize = 25, direction = 'DESC' } = props
    return queryOptions({
        queryKey: ['mempool-transactions', { ...props, pageSize, direction }],
        queryFn: () => getMempoolTransfers({ data: { ...props, pageSize, direction } }),
        placeholderData: keepPreviousData,
    })
}

export function useMempoolTransactions(props: UseMempoolTransactionsProps) {
    return useQuery({
        ...mempoolTransactionsQueryOptions(props),
        refetchInterval: 5000,
    })
}
