import { createFileRoute } from '@tanstack/react-router'
import { MempoolTable } from '@/components/mempool/mempool-table'
import { Inbox } from 'lucide-react'
import * as m from "@/paraglide/messages"

export const Route = createFileRoute('/_layout/mempool')({
    component: MempoolPage,
    head: () => ({
        meta: [
            { title: m.meta_title_mempool({ appName: import.meta.env.VITE_APP_NAME || 'GE Explorer' }) },
            {
                name: 'description',
                content: m.meta_description_mempool({ appName: import.meta.env.VITE_APP_NAME || 'GE Explorer' }),
            },
        ],
    }),
})

function MempoolPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Inbox className="h-4 w-4" />
                    <span>{m.header_mempool()}</span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold">{m.mempool_page_title()}</h1>
                <p className="text-sm text-muted-foreground">
                    {m.mempool_page_subtitle()}
                </p>
            </div>

            {/* Mempool Table */}
            <MempoolTable
                pageSize={25}
            />
        </div>
    )
}
