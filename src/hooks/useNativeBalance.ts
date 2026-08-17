import { queryOptions, useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1AccountBalanceGetByAddressAndTokenContractAddress } from '@/api/gen/clients/apiV1AccountBalanceGetByAddressAndTokenContractAddress'

const NativeBalanceSchema = z.object({
  address: z.string().min(1),
})

export const getNativeBalance = createServerFn()
  .inputValidator(NativeBalanceSchema)
  .handler(async ({ data }) =>
    apiV1AccountBalanceGetByAddressAndTokenContractAddress(
      data.address,
      undefined,
      { client: getClient() },
    ),
  )

export const nativeBalanceQueryOptions = (address: string) =>
  queryOptions({
    queryKey: ['account', address, 'native-balance'],
    queryFn: () => getNativeBalance({ data: { address } }),
  })

export function useNativeBalance(address: string) {
  return useQuery(nativeBalanceQueryOptions(address))
}
