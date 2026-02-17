import { CardList, CardListItem } from "@/components/ui/card-list";
import { AddressLink, HashLink } from "@/components/links";
import { FileText } from "lucide-react";
import { formatTransferType } from "@/lib/utils";
import { TxDtoV1 } from "@/api/gen";
import { useNavigate } from "@tanstack/react-router";
import * as m from "@/paraglide/messages"
import { useTokenUtil } from "@/hooks/useTokenUtil";
import { DateTime } from "../date-time";
import { useTransactions } from "@/hooks/useTransactions";

function TxListItem({ transfer }: { transfer: TxDtoV1 }) {
    const { formatWei: formatAmount } = useTokenUtil({ tokenAddress: transfer.tokenAddress })
    return (
        <CardListItem
            icon={<FileText className="h-5 w-5" />}
            title={
                transfer.hash
                    ? <HashLink hash={transfer.hash} type="tx" />
                    : <span className="text-muted-foreground">{m.common_system()}</span>
            }
            subtitle={<DateTime timestamp={transfer.timestamp} mode="table" />}
            middleContent={
                <>
                    <span className="text-xs text-muted-foreground truncate">
                        <span className="text-muted-foreground/70">{m.common_from()}: </span>
                        <AddressLink address={transfer.sender} />
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        <span className="text-muted-foreground/70">{m.common_to()}: </span>
                        <AddressLink address={transfer.recipient} />
                    </span>
                </>
            }
            rightPrimary={formatAmount(transfer.amount)}
            rightSecondary={formatTransferType(transfer.type)}
        />
    )
}

export function TxList() {
    const { data: transactions, isLoading, refetch, isRefetching } = useTransactions({
        page: 0,
        pageSize: 5
    })

    const navigate = useNavigate()

    const viewAll = () => {
        navigate({ to: '/transactions' })
    }

    return (
        <CardList title={m.latest_transactions_title()} viewAllLabel={m.latest_transactions_view_all()} onViewAll={viewAll} isLoading={isLoading} isRefetching={isRefetching} onRefresh={() => refetch()}>
            {transactions?.list?.map((transfer) => (
                <TxListItem key={transfer.hash} transfer={transfer} />
            ))}
        </CardList>
    );
}
