
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1AccountBalanceGetPage } from '@/api/gen/clients/apiV1AccountBalanceGetPage'
import { queryOptions } from '@tanstack/react-query'
import { ZERO_ADDRESS } from '@goldenera/cryptoj'

const AccountsSchema = z.object({
    page: z.number(),
    pageSize: z.number().optional(),
    tokenAddress: z.string().optional(),
    direction: z.enum(['ASC', 'DESC']).optional(),
})

export const getAccounts = createServerFn()
    .inputValidator(AccountsSchema)
    .handler(async ({ data }) => {
        try {
            const res = await apiV1AccountBalanceGetPage(
                {
                    pageNumber: data.page,
                    pageSize: data.pageSize ?? 25,
                    tokenAddress: data.tokenAddress,
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
            return { list: [], totalPages: 1, totalElements: 0 }
        }
    })

export interface UseAccountsProps {
    page: number
    pageSize?: number
    tokenAddress?: string
    direction?: 'ASC' | 'DESC'
}

export const accountsQueryOptions = (props: UseAccountsProps) => {
    const { pageSize = 25, direction = 'DESC', tokenAddress = ZERO_ADDRESS } = props
    return queryOptions({
        queryKey: ['accounts', { ...props, pageSize, direction, tokenAddress }],
        queryFn: () => getAccounts({ data: { ...props, pageSize, direction, tokenAddress } }),
        placeholderData: keepPreviousData,
    })
}

export function useAccounts(props: UseAccountsProps) {
    return useQuery({
        ...accountsQueryOptions(props),
        refetchInterval: 10000,
    })
}
