import { RefreshCw, Inbox } from "lucide-react";
import { ReactNode, Children } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";
import * as m from "@/paraglide/messages";

interface CardListProps {
    title: string;
    viewAllLabel?: string;
    children: ReactNode;
    className?: string;
    isLoading?: boolean;
    isRefetching?: boolean;
    onRefresh?: () => void;
    onViewAll?: () => void;
}

export function CardList({
    title,
    viewAllLabel,
    children,
    className,
    isLoading = false,
    isRefetching = false,
    onRefresh,
    onViewAll
}: CardListProps) {
    const hasChildren = Children.count(children) > 0;

    return (
        <Card className={cn("flex flex-col h-full shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                {onRefresh && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isRefetching}
                        className="h-8"
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', isRefetching && 'animate-spin')} />
                        <span className="sr-only">
                            {m.common_refresh()}
                        </span>
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <div className="flex flex-col h-full">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b last:border-0 gap-3 sm:gap-4 sm:h-[84px]">
                                <div className="flex items-center gap-3 w-full sm:w-[200px] md:w-[240px] shrink-0">
                                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                                    <div className="flex flex-col gap-2 w-full">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 flex-1 pl-[52px] sm:pl-0 sm:items-center">
                                    <Skeleton className="h-3 w-full max-w-[200px]" />
                                    <Skeleton className="h-3 w-full max-w-[150px]" />
                                </div>
                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-2 shrink-0 pl-[52px] sm:pl-0 sm:w-[120px] md:w-[160px]">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        ))
                    ) : !hasChildren ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-[420px]">
                            <div className="bg-muted/50 p-4 rounded-full mb-4">
                                <Inbox className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">{m.common_no_items_found()}</p>
                            <p className="text-xs text-muted-foreground mb-6 max-w-[200px]">
                                {m.common_no_items_description()}
                            </p>
                            {onRefresh && (
                                <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefetching} className="gap-2">
                                    {isRefetching ? (
                                        <Spinner />
                                    ) : (<RefreshCw className="h-3.5 w-3.5" />)}
                                    {m.common_refresh()}
                                </Button>
                            )}
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onViewAll} className='w-full' variant="outline">
                    {viewAllLabel ?? m.common_view_all()}
                </Button>
            </CardFooter>
        </Card>
    );
}

interface CardListItemProps {
    icon: ReactNode;
    title: ReactNode;
    subtitle: ReactNode;
    middleContent?: ReactNode;
    rightPrimary?: ReactNode;
    rightSecondary?: ReactNode;
    className?: string;
}

export function CardListItem({
    icon,
    title,
    subtitle,
    middleContent,
    rightPrimary,
    rightSecondary,
    className
}: CardListItemProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b last:border-0 transition-colors gap-3 sm:gap-4 sm:h-[84px]", className)}>
            <div className="flex items-center justify-between sm:justify-start gap-3 overflow-hidden min-w-0 sm:w-[200px] md:w-[240px] shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-muted/50 p-2.5 rounded-lg text-muted-foreground shrink-0 border border-muted-foreground/10">
                        {icon}
                    </div>
                    <div className="flex flex-col justify-center gap-0.5 overflow-hidden min-w-0">
                        <span className="text-xs font-medium truncate">
                            {title}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                            {subtitle}
                        </span>
                    </div>
                </div>
                {/* Mobile: Show primary info at top right if space allows */}
                <div className="sm:hidden text-xs font-medium text-right shrink-0">
                    {rightPrimary}
                </div>
            </div>

            {middleContent && (
                <div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1 pl-[52px] sm:pl-0 sm:items-center">
                    <div className="w-full flex flex-col sm:items-start text-left sm:max-w-fit">
                        {middleContent}
                    </div>
                </div>
            )}

            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0.5 shrink-0 pl-[52px] sm:pl-0 sm:w-[120px] md:w-[160px]">
                <div className="hidden sm:block text-xs font-medium text-right w-full truncate">
                    {rightPrimary}
                </div>
                <span className="text-xs text-muted-foreground text-right w-full truncate">
                    {rightSecondary}
                </span>
            </div>
        </div>
    );
}
