
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1AccountBalanceGetPage } from '@/api/gen/clients/apiV1AccountBalanceGetPage'
import { queryOptions } from '@tanstack/react-query'

const BalancesSchema = z.object({
    address: z.string(),
    page: z.number(),
    pageSize: z.number().optional(),
    direction: z.enum(['ASC', 'DESC']).optional(),
})

export const getBalances = createServerFn()
    .inputValidator(BalancesSchema)
    .handler(async ({ data }) => {
        try {
            const res = await apiV1AccountBalanceGetPage(
                {
                    address: data.address,
                    pageNumber: data.page,
                    pageSize: data.pageSize ?? 10,
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
            throw new Error("Failed to fetch token holdings")
        }
    })

export interface UseTokenHoldingsProps {
    address: string
    page: number
    pageSize?: number
    direction?: 'ASC' | 'DESC'
    autoRefetch?: boolean
}

export const tokenHoldingsQueryOptions = ({ address, page, pageSize = 10, direction = 'DESC' }: Omit<UseTokenHoldingsProps, 'autoRefetch'>) =>
    queryOptions({
        queryKey: ['token-holdings', address, page, pageSize, direction],
        queryFn: () => getBalances({ data: { address, page, pageSize, direction } }),
        placeholderData: keepPreviousData,
    })

export function useTokenHoldings(props: UseTokenHoldingsProps) {
    const { autoRefetch = false, ...queryProps } = props
    return useQuery({
        ...tokenHoldingsQueryOptions(queryProps),
        refetchInterval: autoRefetch ? 10000 : false,
    })
}
