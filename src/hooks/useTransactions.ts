
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1TxGetPage } from '@/api/gen/clients/apiV1TxGetPage'
import { queryOptions } from '@tanstack/react-query'

const TransfersSchema = z.object({
    address: z.string().optional(),
    sender: z.string().optional(),
    recipient: z.string().optional(),
    tokenAddress: z.string().optional(),
    referenceHash: z.string().optional(),
    blockHash: z.string().optional(),
    type: z.string().optional(),
    page: z.number(),
    pageSize: z.number().optional(),
    direction: z.enum(['ASC', 'DESC']).optional(),
})

export const getTransactions = createServerFn()
    .inputValidator(TransfersSchema)
    .handler(async ({ data }) => {
        try {
            const queryParams: Record<string, unknown> = {
                pageNumber: data.page,
                pageSize: data.pageSize ?? 15,
                direction: data.direction ?? 'DESC',
            }

            if (data.address) queryParams.address = data.address
            if (data.sender) queryParams.sender = data.sender
            if (data.recipient) queryParams.recipient = data.recipient
            if (data.tokenAddress) queryParams.tokenAddress = data.tokenAddress
            if (data.referenceHash) queryParams.referenceHash = data.referenceHash
            if (data.blockHash) queryParams.blockHash = data.blockHash
            if (data.type) queryParams.type = data.type

            const res = await apiV1TxGetPage(queryParams as any, { client: getClient() })
            return {
                list: res.list || [],
                totalPages: res.totalPages || 1,
                totalElements: res.totalElements || 0,
            }
        } catch (e) {
            return { list: [], totalPages: 1, totalElements: 0 }
        }
    })

export interface UseTransactionsProps {
    address?: string
    sender?: string
    recipient?: string
    tokenAddress?: string
    referenceHash?: string
    blockHash?: string
    type?: string
    page: number
    pageSize?: number
    direction?: 'ASC' | 'DESC'
}

export const transactionsQueryOptions = (props: UseTransactionsProps) => {
    // Determine the query key based on props, similar to how it was in the component
    // But slightly cleaner
    const { pageSize = 15, direction = 'DESC' } = props

    // We can simplify the query key to basically include everything
    // But keep it consistent with the previous key structure if possible or just use a new one
    // Old key: ['transfers-table', address, tokenAddress, txHash, blockHash, pageIndex, txFilter, typeFilter, pageSize, direction]
    // Let's use a more robust object-based key or just ordered params
    return queryOptions({
        queryKey: ['transactions', { ...props, pageSize, direction }],
        queryFn: () => getTransactions({ data: { ...props, pageSize, direction } }),
        placeholderData: keepPreviousData,
    })
}

export function useTransactions(props: UseTransactionsProps) {
    return useQuery({
        ...transactionsQueryOptions(props),
        refetchInterval: 10000,
    })
}
