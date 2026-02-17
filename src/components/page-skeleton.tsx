import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function PageSkeleton() {
    return (
        <div className="container mx-auto px-4 md:px-8 py-8 space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>

            {/* Content Skeleton - Grid/Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-[200px]">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
