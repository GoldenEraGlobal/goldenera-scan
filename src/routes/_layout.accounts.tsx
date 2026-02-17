import { createFileRoute } from '@tanstack/react-router'
import { AccountsTable } from '@/components/account/accounts-table'
import { Users } from 'lucide-react'
import * as m from "@/paraglide/messages"

export const Route = createFileRoute('/_layout/accounts')({
    component: AccountsPage,
    loader: ({ context }) => {
        const { APP_NAME } = context

        return {
            APP_NAME
        }
    },
    head: ({ loaderData }) => ({
        meta: [
            { title: m.meta_title_accounts({ appName: loaderData?.APP_NAME || 'GoldenEra Scan' }) },
            {
                name: 'description',
                content: m.meta_description_accounts({ appName: loaderData?.APP_NAME || 'GoldenEra Scan' }),
            },
        ],
    }),
})

function AccountsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Users className="h-4 w-4" />
                    <span>{m.header_accounts()}</span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold">{m.accounts_page_title()}</h1>
                <p className="text-sm text-muted-foreground">
                    {m.accounts_page_subtitle()}
                </p>
            </div>

            <AccountsTable
                title={m.accounts_table_title()}
                pageSize={25}
            />
        </div>
    )
}
