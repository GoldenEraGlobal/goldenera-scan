
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function DetailList({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6", className)}>
            {children}
        </div>
    )
}

export function DetailItem({
    icon: Icon,
    label,
    children,
    loading,
    className,
}: {
    icon?: React.ComponentType<{ className?: string }>
    label: string
    children: React.ReactNode
    loading?: boolean
    className?: string
}) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
            </div>
            {loading ? (
                <Skeleton className="h-6 w-32" />
            ) : (
                <div className="text-sm font-medium text-foreground">{children}</div>
            )}
        </div>
    )
}
