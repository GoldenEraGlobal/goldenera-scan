import { createServerFn } from "@tanstack/react-start";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiV1TokenGetPage } from "@/api/gen/clients/apiV1TokenGetPage";
import { getClient } from "@/api/client";
import { TokenDtoV1 } from "@/api/gen";

export const getAllTokens = createServerFn()
    .handler(async () => {
        try {
            const firstPage = await apiV1TokenGetPage(
                { pageNumber: 0, pageSize: 100 },
                { client: getClient() }
            );

            const allTokens: TokenDtoV1[] = firstPage.list || [];
            const totalPages = firstPage.totalPages || 1;

            if (totalPages > 1) {
                const remainingPages = await Promise.all(
                    Array.from({ length: totalPages - 1 }, (_, i) =>
                        apiV1TokenGetPage(
                            { pageNumber: i + 1, pageSize: 100 },
                            { client: getClient() }
                        )
                    )
                );

                remainingPages.forEach((page) => {
                    if (page.list) {
                        allTokens.push(...page.list);
                    }
                });
            }

            return allTokens;
        } catch (e) {
            throw new Error("Failed to fetch all tokens");
        }
    });

export const tokensQueryOptions = () =>
    queryOptions({
        queryKey: ["tokens", "all"],
        queryFn: getAllTokens,
    })

export function useTokens({ autoRefetch = false }: { autoRefetch?: boolean } = {}) {
    return useQuery({
        ...tokensQueryOptions(),
        refetchInterval: autoRefetch ? 10000 : false,
    });
}