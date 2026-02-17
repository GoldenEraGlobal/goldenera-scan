import { createFileRoute } from '@tanstack/react-router'
import { BlocksTable } from '@/components/block/blocks-table'
import { Box } from 'lucide-react'
import * as m from "@/paraglide/messages"

export const Route = createFileRoute('/_layout/blocks')({
    component: BlocksPage,
    loader: ({ context }) => {
        const { APP_NAME } = context

        return {
            APP_NAME
        }
    },
    head: ({ loaderData }) => ({
        meta: [
            { title: m.meta_title_blocks({ appName: loaderData?.APP_NAME || 'GoldenEra Scan' }) },
            {
                name: 'description',
                content: m.meta_description_blocks({ appName: loaderData?.APP_NAME || 'GoldenEra Scan' }),
            },
        ],
    }),
})

function BlocksPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Box className="h-4 w-4" />
                    <span>{m.header_blocks()}</span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold">{m.common_all_blocks()}</h1>
                <p className="text-sm text-muted-foreground">
                    {m.blocks_page_subtitle()}
                </p>
            </div>

            {/* Blocks Table */}
            <BlocksTable
                title={m.common_all_blocks()}
                pageSize={25}
            />
        </div>
    )
}
