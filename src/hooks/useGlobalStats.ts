
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { apiV1BlockGetCount } from "@/api/gen/clients/apiV1BlockGetCount";
import { apiV1TxGetCount } from "@/api/gen/clients/apiV1TxGetCount";
import { apiV1MemTransferGetCount } from "@/api/gen/clients/apiV1MemTransferGetCount";
import { getClient } from "@/api/client";

export const getGlobalStats = createServerFn().handler(async () => {
    try {
        const client = getClient();
        const [blockCount, txCount, mempoolSize] = await Promise.all([
            apiV1BlockGetCount({ client }),
            apiV1TxGetCount({ client }),
            apiV1MemTransferGetCount({ client }),
        ]);

        return {
            latestBlock: Math.max(0, Number(blockCount) - 1),
            txCount: Number(txCount),
            mempoolSize: Number(mempoolSize),
        };
    } catch (e) {
        console.error("Failed to fetch global stats:", e);
        throw new Error("Failed to fetch global stats");
    }
});

export const requestGlobalStatsQueryOptions = () =>
    queryOptions({
        queryKey: ["stats", "global"],
        queryFn: () => getGlobalStats(),
        refetchInterval: 5000, // Refresh every 5 seconds
    });

export function useGlobalStats({ autoRefetch = false }: { autoRefetch?: boolean } = {}) {
    return useQuery({
        ...requestGlobalStatsQueryOptions(),
        refetchInterval: autoRefetch ? 5000 : false,
    });
}
