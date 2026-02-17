
import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1TokenGetByAddress } from '@/api/gen/clients/apiV1TokenGetByAddress'
import { queryOptions } from '@tanstack/react-query'

const TokenSchema = z.object({
    address: z.string().min(1),
})

export const getToken = createServerFn()
    .inputValidator(TokenSchema)
    .handler(async ({ data }) => {
        try {
            return await apiV1TokenGetByAddress(data.address, { client: getClient() })
        } catch (e) {
            return null
        }
    })

export const tokenQueryOptions = (address: string) =>
    queryOptions({
        queryKey: ["token-detail", address],
        queryFn: () => getToken({ data: { address } }),
    })

export interface UseTokenDetailProps {
    address: string
}

export function useTokenDetail({ address }: UseTokenDetailProps) {
    return useQuery(tokenQueryOptions(address))
}
