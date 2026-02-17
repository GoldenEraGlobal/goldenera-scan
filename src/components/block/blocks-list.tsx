import { Box } from "lucide-react";
import { CardList, CardListItem } from "@/components/ui/card-list";
import { AddressLink, HashLink } from "@/components/links";
import { useNavigate } from "@tanstack/react-router";
import * as m from "@/paraglide/messages"
import { DateTime } from "../date-time";
import { formatNum } from "@/lib/utils";
import { useBlocks } from "@/hooks/useBlocks";

export function BlocksList() {
    const { data: blocks, isLoading, refetch, isRefetching } = useBlocks({
        page: 0,
        pageSize: 5
    })

    const navigate = useNavigate()

    return (
        <CardList
            title={m.latest_blocks_title()}
            viewAllLabel={m.latest_blocks_view_all()}
            isLoading={isLoading}
            isRefetching={isRefetching}
            onRefresh={() => refetch()}
            onViewAll={() => navigate({ to: '/blocks' })}
        >
            {blocks?.list?.map((block) => (
                <CardListItem
                    key={block.hash}
                    icon={<Box className="h-5 w-5" />}
                    title={<HashLink hash={block.hash} type="block" />}
                    subtitle={<DateTime timestamp={block.timestamp} mode="table" />}
                    middleContent={
                        <>
                            <span className="text-xs text-muted-foreground truncate">
                                <span className="text-muted-foreground/70">{m.latest_blocks_miner()}: </span>
                                <AddressLink address={block.identity} />
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                <span className="text-muted-foreground/70">{m.latest_blocks_coinbase()}: </span>
                                <AddressLink address={block.coinbase} />
                            </span>
                        </>
                    }
                    rightPrimary={m.latest_blocks_txs_count({ count: formatNum(block.numberOfTxs) })}
                    rightSecondary={`${m.common_height()}: ${formatNum(block.height)}`}
                />
            ))}
        </CardList>
    );
}

