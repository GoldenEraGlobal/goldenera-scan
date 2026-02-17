import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { HeroSearch } from "@/components/home/hero-search";
import { StatsGrid } from "@/components/home/stats-grid";
import { BlocksList } from "@/components/block/blocks-list";
import { TxList } from "@/components/tx/tx-list";
import { MempoolList } from "@/components/mempool/mempool-list";
import { blocksQueryOptions } from "@/hooks/useBlocks";
import { transactionsQueryOptions } from "@/hooks/useTransactions";
import { mempoolTransactionsQueryOptions } from "@/hooks/useMempoolTransactions";
import { requestGlobalStatsQueryOptions } from "@/hooks/useGlobalStats";

import * as m from "@/paraglide/messages"

export const Route = createFileRoute("/")({
  validateSearch: (search) => z.object({}).parse(search),
  loader: async ({ context }) => {
    const { queryClient } = context

    await Promise.all([
      queryClient.ensureQueryData(blocksQueryOptions({ page: 0, pageSize: 5 })),
      queryClient.ensureQueryData(transactionsQueryOptions({ page: 0, pageSize: 5 })),
      queryClient.ensureQueryData(mempoolTransactionsQueryOptions({ page: 0, pageSize: 5 })),
      queryClient.ensureQueryData(requestGlobalStatsQueryOptions()),
    ])
  },
  component: App,
  head: () => ({
    meta: [
      { title: import.meta.env.VITE_APP_NAME || 'GE Explorer' },
      {
        name: 'description',
        content: m.meta_description_default(),
      },
    ],
  }),
});

function App() {
  return (
    <>
      <HeroSearch />
      <div className="container mx-auto px-4 md:px-8 pb-16 flex-1">
        <StatsGrid />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BlocksList />
          <TxList />
          <div className="xl:col-span-2">
            <MempoolList />
          </div>
        </div>
      </div>
    </>
  );
}
