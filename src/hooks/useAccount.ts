import { queryOptions, useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1AccountStatsGetByAddress } from '@/api/gen/clients/apiV1AccountStatsGetByAddress'

const AccountSchema = z.object({
  address: z.string().min(1),
})

export const getAccount = createServerFn()
  .inputValidator(AccountSchema)
  .handler(async ({ data }) => {
    try {
      return await apiV1AccountStatsGetByAddress(data.address, {
        client: getClient(),
      })
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return {
          address: data.address,
          balanceInNativeToken: '0',
          nonce: 0,
          totalTransactionsReceived: 0,
          totalTransactionsSent: 0,
          distinctTokenCount: 0,
          authority: false,
        }
      }
      throw error
    }
  })

export const accountQueryOptions = (address: string) =>
  queryOptions({
    queryKey: ['account', address],
    queryFn: () => getAccount({ data: { address } }),
  })

export interface UseAccountProps {
  address: string
  autoRefetch?: boolean
}

export function useAccount({ address, autoRefetch = false }: UseAccountProps) {
  return useQuery({
    ...accountQueryOptions(address),
    refetchInterval: autoRefetch ? 10000 : false,
  })
}
