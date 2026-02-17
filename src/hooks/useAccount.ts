
import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1AccountStatsGetByAddress } from '@/api/gen/clients/apiV1AccountStatsGetByAddress'
import { queryOptions } from '@tanstack/react-query'

const AccountSchema = z.object({
    address: z.string().min(1),
})

export const getAccount = createServerFn()
    .inputValidator(AccountSchema)
    .handler(async ({ data }) => {
        try {
            return await apiV1AccountStatsGetByAddress(data.address, { client: getClient() })
        } catch (e) {
            return null
        }
    })

export const accountQueryOptions = (address: string) =>
    queryOptions({
        queryKey: ["account", address],
        queryFn: () => getAccount({ data: { address } }),
    })

export interface UseAccountProps {
    address: string
}

export function useAccount({ address }: UseAccountProps) {
    return useQuery({
        ...accountQueryOptions(address),
        refetchInterval: 10000,
    })
}
