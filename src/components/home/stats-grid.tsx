import { Activity, Layers, ArrowRightLeft, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import * as m from "@/paraglide/messages"
import { formatNum } from "@/lib/utils";
import { useGlobalStats } from "@/hooks/useGlobalStats";

export function StatsGrid() {
    const { data: stats, isLoading } = useGlobalStats();

    return (
        <div className="container mx-auto px-4 md:px-8 -mt-12 md:-mt-16 relative z-20 mb-8">
            <Card className="shadow-xl bg-card border-border overflow-hidden">
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 lg:grid-cols-4">
                        {/* Item 1: Price (Reserved for future use) */}
                        <div className="p-3 lg:p-4 flex items-center gap-2 lg:gap-3 border-r border-b lg:border-b-0 border-border">
                            <div className="p-2 lg:p-2.5 bg-blue-500/10 text-blue-500 rounded-full shrink-0">
                                <Activity className="h-4 w-4 lg:h-5 lg:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] lg:text-xs text-muted-foreground font-medium truncate uppercase tracking-wider">{m.stats_price()}</p>
                                <p className="text-sm lg:text-base font-bold truncate">$1.24</p>
                            </div>
                        </div>

                        {/* Item 2: Latest Block */}
                        <div className="p-3 lg:p-4 flex items-center gap-2 lg:gap-3 border-b lg:border-b-0 lg:border-r border-border">
                            <div className="p-2 lg:p-2.5 bg-purple-500/10 text-purple-500 rounded-full shrink-0">
                                <Layers className="h-4 w-4 lg:h-5 lg:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] lg:text-xs text-muted-foreground font-medium truncate uppercase tracking-wider">{m.stats_latest_block()}</p>
                                {isLoading ? (
                                    <Skeleton className="h-5 w-20 mt-1" />
                                ) : (
                                    <p className="text-sm lg:text-base font-bold truncate">#{formatNum(stats?.latestBlock)}</p>
                                )}
                            </div>
                        </div>

                        {/* Item 3: Total Transactions */}
                        <div className="p-3 lg:p-4 flex items-center gap-2 lg:gap-3 border-r border-border">
                            <div className="p-2 lg:p-2.5 bg-pending/10 text-pending rounded-full shrink-0">
                                <ArrowRightLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] lg:text-xs text-muted-foreground font-medium truncate uppercase tracking-wider">{m.stats_transactions()}</p>
                                {isLoading ? (
                                    <Skeleton className="h-5 w-24 mt-1" />
                                ) : (
                                    <p className="text-sm lg:text-base font-bold truncate">{formatNum(stats?.txCount)}</p>
                                )}
                            </div>
                        </div>

                        {/* Item 4: Mempool Transactions */}
                        <div className="p-3 lg:p-4 flex items-center gap-2 lg:gap-3">
                            <div className="p-2 lg:p-2.5 bg-success/10 text-success rounded-full shrink-0">
                                <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] lg:text-xs text-muted-foreground font-medium truncate uppercase tracking-wider">{m.stats_mempool()}</p>
                                {isLoading ? (
                                    <Skeleton className="h-5 w-16 mt-1" />
                                ) : (
                                    <p className="text-sm lg:text-base font-bold truncate">{m.stats_pending({ count: formatNum(stats?.mempoolSize) })}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
