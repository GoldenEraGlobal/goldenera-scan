
import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1CommonSearch } from '@/api/gen/clients/apiV1CommonSearch'

const SearchSchema = z.object({
    query: z.string().min(1),
})

export const searchBlockchain = createServerFn()
    .inputValidator(SearchSchema)
    .handler(async ({ data }) => {
        try {
            const res = await apiV1CommonSearch({
                query: data.query,
            }, {
                client: getClient()
            })
            return res ?? {}
        } catch (e) {
            console.error("Search failed:", e)
            throw new Error("Search failed")
        }
    })

export function useSearchResult(query: string, autoRefetch: boolean = false) {
    return useQuery({
        queryKey: ['search', query],
        queryFn: () => searchBlockchain({ data: { query } }),
        enabled: query.length > 0,
        retry: false,
        refetchInterval: autoRefetch ? 10000 : false,
    })
}
