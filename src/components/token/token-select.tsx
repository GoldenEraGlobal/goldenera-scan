

import * as React from 'react'
import { useTokens } from '@/hooks/useTokens'
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
} from '@/components/ui/combobox'
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import * as m from "@/paraglide/messages"
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { TokenDtoV1 } from '@/api/gen'
import { ChevronDown } from 'lucide-react'

interface TokenSelectProps {
    value?: string
    onValueChange: (value: string) => void
    className?: string
}

export function TokenSelect({ value, onValueChange, className }: TokenSelectProps) {
    const { data: tokens } = useTokens()

    const selectedToken = React.useMemo(
        () => tokens?.find((t) => t.address === value) || null,
        [tokens, value]
    )

    return (
        <Combobox
            items={tokens || []}
            value={selectedToken}
            onValueChange={(token: TokenDtoV1 | null) => {
                if (token?.address) {
                    onValueChange(token.address)
                }
            }}
            itemToStringValue={(token: TokenDtoV1) => token.name || ''}
        >
            <ComboboxTrigger render={
                <Button
                    variant="outline"
                    size="sm"
                    className={cn("h-8 w-[200px] justify-between font-normal px-2", className)}
                >
                    <div className="flex items-center gap-2 truncate text-xs">
                        {selectedToken ? (
                            <>
                                <Avatar className="h-4 w-4">
                                    {selectedToken.logoUrl ? (
                                        <AvatarImage src={selectedToken.logoUrl} alt={selectedToken.name} />
                                    ) : null}
                                    <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-bold">
                                        {selectedToken.name?.slice(0, 2).toUpperCase() || '??'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="truncate font-medium">{selectedToken.name}</span>
                                <span className="text-muted-foreground opacity-70">({selectedToken.smallestUnitName})</span>
                            </>
                        ) : (
                            <span className="text-muted-foreground">{m.token_select_placeholder()}</span>
                        )}
                    </div>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            } />

            <ComboboxContent align="end" className="w-[300px]">
                <ComboboxInput
                    showTrigger={false}
                    placeholder={m.token_select_search()}
                    className="h-9"
                />
                <ComboboxEmpty>{m.address_no_tokens_found()}</ComboboxEmpty>
                <ComboboxList className="max-h-[300px]">
                    {(token: TokenDtoV1) => (
                        <ComboboxItem key={token.address} value={token} className="py-2">
                            <Item size="xs" className="p-0 bg-transparent flex items-center gap-3">
                                <Avatar className="h-7 w-7">
                                    {token.logoUrl ? (
                                        <AvatarImage src={token.logoUrl} alt={token.name} />
                                    ) : null}
                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                                        {token.name?.slice(0, 2).toUpperCase() || '??'}
                                    </AvatarFallback>
                                </Avatar>
                                <ItemContent className="flex flex-col gap-0.5">
                                    <ItemTitle className="whitespace-nowrap font-medium text-sm leading-tight">
                                        {token.name} <span className="text-xs text-muted-foreground font-normal">({token.smallestUnitName})</span>
                                    </ItemTitle>
                                    <ItemDescription className="text-[10px] font-mono opacity-50 truncate w-[200px]">
                                        {token.address}
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
