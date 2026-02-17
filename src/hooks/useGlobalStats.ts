
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getLatestBlockHeight } from "@/api/gen/clients/getLatestBlockHeight";
import { apiV1TxGetCount } from "@/api/gen/clients/apiV1TxGetCount";
import { getMempoolTransactionSize } from "@/api/gen/clients/getMempoolTransactionSize";
import { getClient } from "@/api/client";

export const getGlobalStats = createServerFn().handler(async () => {
    try {
        const client = getClient();
        const [latestBlock, txCount, mempoolSize] = await Promise.all([
            getLatestBlockHeight({ client }),
            apiV1TxGetCount({ client }),
            getMempoolTransactionSize({ client }),
        ]);

        return {
            latestBlock: Number(latestBlock),
            txCount: Number(txCount),
            mempoolSize: Number(mempoolSize),
        };
    } catch (e) {
        console.error("Failed to fetch global stats:", e);
        return {
            latestBlock: 0,
            txCount: 0,
            mempoolSize: 0,
        };
    }
});

export const requestGlobalStatsQueryOptions = () =>
    queryOptions({
        queryKey: ["stats", "global"],
        queryFn: () => getGlobalStats(),
        refetchInterval: 5000, // Refresh every 5 seconds
    });

export function useGlobalStats() {
    return useQuery(requestGlobalStatsQueryOptions());
}
