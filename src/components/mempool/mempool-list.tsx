import { FileText } from "lucide-react";
import { CardList, CardListItem } from "@/components/ui/card-list";
import { AddressLink, HashLink } from "@/components/links";
import { MemTransferDtoV1 } from "@/api/gen";
import { formatTransferType } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import * as m from "@/paraglide/messages"
import { useMempoolTransactions } from "@/hooks/useMempoolTransactions";
import { Badge } from "@/components/ui/badge";
import { useTokenUtil } from "@/hooks/useTokenUtil";
import { DateTime } from "../date-time";

function MempoolListItem({ transfer }: { transfer: MemTransferDtoV1 }) {
    const { formatWei } = useTokenUtil({
        tokenAddress: transfer.tokenAddress
    })
    return (
        <CardListItem
            icon={<FileText className="h-5 w-5" />}
            title={
                transfer.hash
                    ? <HashLink hash={transfer.hash} type="tx" />
                    : <Badge variant="secondary" className="text-xs">{m.common_system()}</Badge>
            }
            subtitle={<DateTime timestamp={transfer.txTimestamp} />}
            middleContent={
                <>
                    <span className="text-xs text-muted-foreground truncate">
                        <span className="text-muted-foreground/70">{m.common_from()}: </span>
                        <AddressLink address={transfer.from} />
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        <span className="text-muted-foreground/70">{m.common_to()}: </span>
                        <AddressLink address={transfer.to} />
                    </span>
                </>
            }
            rightPrimary={formatWei(transfer.amount)}
            rightSecondary={formatTransferType(transfer.txType)}
        />
    )
}

export function MempoolList() {
    const { data: transfers, isLoading, refetch, isRefetching } = useMempoolTransactions({
        page: 0,
        pageSize: 5
    })

    const navigate = useNavigate()

    return (
        <CardList
            title={m.mempool_title()}
            viewAllLabel={m.mempool_view_all()}
            isLoading={isLoading}
            isRefetching={isRefetching}
            onRefresh={() => refetch()}
            onViewAll={() => navigate({ to: '/mempool' })}
        >
            {transfers?.list?.map((transfer) => (
                <MempoolListItem key={transfer.hash} transfer={transfer} />
            ))}
        </CardList>
    );
}
