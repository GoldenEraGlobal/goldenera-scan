
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1AccountBalanceGetPage } from '@/api/gen/clients/apiV1AccountBalanceGetPage'
import { queryOptions } from '@tanstack/react-query'

const HoldersSchema = z.object({
    tokenAddress: z.string(),
    page: z.number(),
    pageSize: z.number().optional(),
    direction: z.enum(['ASC', 'DESC']).optional(),
})

export const getHolders = createServerFn()
    .inputValidator(HoldersSchema)
    .handler(async ({ data }) => {
        try {
            const res = await apiV1AccountBalanceGetPage(
                {
                    tokenAddress: data.tokenAddress,
                    pageNumber: data.page,
                    pageSize: data.pageSize ?? 15,
                    balanceGreaterThan: '0',
                    direction: data.direction ?? 'DESC',
                },
                { client: getClient() }
            )
            return {
                list: res.list || [],
                totalPages: res.totalPages || 1,
                totalElements: res.totalElements || 0,
            }
        } catch (e) {
            throw new Error("Failed to fetch token holders")
        }
    })

export interface UseTokenHoldersProps {
    tokenAddress: string
    page: number
    pageSize?: number
    direction?: 'ASC' | 'DESC'
    autoRefetch?: boolean
}

export const tokenHoldersQueryOptions = ({ tokenAddress, page, pageSize = 15, direction = 'DESC' }: Omit<UseTokenHoldersProps, 'autoRefetch'>) =>
    queryOptions({
        queryKey: ['token-holders', tokenAddress, page, pageSize, direction],
        queryFn: () => getHolders({ data: { tokenAddress, page, pageSize, direction } }),
        placeholderData: keepPreviousData,
    })

export function useTokenHolders(props: UseTokenHoldersProps) {
    const { autoRefetch = false, ...queryProps } = props
    return useQuery({
        ...tokenHoldersQueryOptions(queryProps),
        refetchInterval: autoRefetch ? 10000 : false,
    })
}
