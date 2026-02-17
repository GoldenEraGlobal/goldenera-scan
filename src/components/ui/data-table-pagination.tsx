import { type Table } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { cn, formatNum } from '@/lib/utils'
import * as m from "@/paraglide/messages"

interface DataTablePaginationProps<TData> {
    table: Table<TData>
}

export function DataTablePagination<TData>({
    table,
}: DataTablePaginationProps<TData>) {
    const pageIndex = table.getState().pagination.pageIndex
    const pageCount = table.getPageCount()

    // Calculate visible page numbers
    const visiblePages = useMemo(() => {
        const pages: (number | 'ellipsis')[] = []

        if (pageCount <= 1) return pages

        // Always show first page
        pages.push(0)

        // Calculate range around current page
        const rangeStart = Math.max(1, pageIndex - 1)
        const rangeEnd = Math.min(pageCount - 2, pageIndex + 1)

        // Add ellipsis after first page if needed
        if (rangeStart > 1) {
            pages.push('ellipsis')
        }

        // Add pages around current
        for (let i = rangeStart; i <= rangeEnd; i++) {
            if (i > 0 && i < pageCount - 1) {
                pages.push(i)
            }
        }

        // Add ellipsis before last page if needed
        if (rangeEnd < pageCount - 2) {
            pages.push('ellipsis')
        }

        // Always show last page
        if (pageCount > 1) {
            pages.push(pageCount - 1)
        }

        return pages
    }, [pageIndex, pageCount])

    if (pageCount <= 1) return null

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t">
            <span className="text-sm text-muted-foreground">
                {m.pagination_page_of({ current: formatNum(pageIndex + 1), total: formatNum(pageCount) })}
            </span>

            {/* Mobile: Simple Previous/Next buttons */}
            <div className="flex md:hidden items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {m.pagination_previous()}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    {m.pagination_next()}
                </Button>
            </div>

            {/* Desktop: Full pagination with page numbers */}
            <Pagination className="hidden md:flex w-auto mx-0 justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                table.previousPage()
                            }}
                            className={cn(!table.getCanPreviousPage() && 'pointer-events-none opacity-50')}
                            text={m.pagination_previous()}
                        />
                    </PaginationItem>

                    {visiblePages.map((page, index) => (
                        <PaginationItem key={index}>
                            {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    isActive={page === pageIndex}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        table.setPageIndex(page)
                                    }}
                                >
                                    {page + 1}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                table.nextPage()
                            }}
                            className={cn(!table.getCanNextPage() && 'pointer-events-none opacity-50')}
                            text={m.pagination_next()}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
