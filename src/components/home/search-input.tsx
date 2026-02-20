

import {
    Autocomplete,
    AutocompleteCollection,
    AutocompleteContent,
    AutocompleteEmpty,
    AutocompleteGroup,
    AutocompleteInput,
    AutocompleteItem,
    AutocompleteLabel,
    AutocompleteList,
    AutocompleteSeparator,
    AutocompleteStatus
} from "@/components/ui/autocomplete"
import { Search, Wallet, FileText, Clock, Box, Coins, ShieldCheck, Shield, AtSign } from "lucide-react"
import { useMemo, useState, useEffect, useCallback } from "react"
import { AccountBalanceDtoV1, AddressAliasDtoV1, AuthorityDtoV1, BlockHeaderDtoV1, MemTransferDtoV1, TokenDtoV1, TxDtoV1, ValidatorDtoV1 } from "@/api/gen"
import { Badge } from "../ui/badge"
import { Spinner } from "../ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { compareAddress, formatWei, shortenAddress, formatTransferType, formatNum } from "@/lib/utils"
import { useNavigate } from "@tanstack/react-router"
import { useTokens } from "@/hooks/useTokens"
import * as m from "@/paraglide/messages"
import { useSearchResult } from "@/hooks/useSearchResult"
import { useDebounce } from "@/hooks/useDebounce"

interface SearchInputProps {
    className?: string
    placeholder?: string
}

type Item = (AccountBalanceDtoV1 & { entity: 'account' }) | (TxDtoV1 & { entity: 'tx' }) | (MemTransferDtoV1 & { entity: 'mempool-tx' }) | (BlockHeaderDtoV1 & { entity: 'block' }) | (TokenDtoV1 & { entity: 'token' }) | (ValidatorDtoV1 & { entity: 'validator' }) | (AuthorityDtoV1 & { entity: 'authority' }) | (AddressAliasDtoV1 & { entity: 'address-alias' })

const toStr = (item?: any) => {
    if (typeof item === 'string') return item
    if (!item || typeof item !== 'object') return ""

    switch (item.entity) {
        case 'account':
            return item.address || ""
        case 'mempool-tx':
            return item.hash || ""
        case 'tx':
            return item.hash || ""
        case 'block':
            return `${item.height}#${item.hash}`
        case 'token':
            return item.name || ""
        case 'validator':
            return item.address || ""
        case 'authority':
            return item.address || ""
        case 'address-alias':
            return item.alias || ""
        default:
            return ""
    }
}

const toValue = (item?: any) => {
    if (typeof item === 'string') return item
    if (!item || typeof item !== 'object') return ""

    switch (item.entity) {
        case 'account':
            return `account:${item.tokenAddress}:${item.address}`
        case 'mempool-tx':
            return `mempool-tx:${item.hash}`
        case 'tx':
            return `tx:${item.hash}`
        case 'block':
            return `block:${item.height}#${item.hash}`
        case 'token':
            return `token:${item.address}`
        case 'validator':
            return `validator:${item.address}`
        case 'authority':
            return `authority:${item.address}`
        case 'address-alias':
            return `address-alias:${item.alias}`
        default:
            return ""
    }
}

function ItemContent({ item }: { item: Item }) {
    const { data: tokens } = useTokens()

    const iconMap = {
        account: Wallet,
        tx: FileText,
        'mempool-tx': Clock,
        block: Box,
        token: Coins,
        validator: ShieldCheck,
        authority: Shield,
        'address-alias': AtSign,
    }

    const Icon = iconMap[item.entity]

    let title = ""
    let subtitle = ""
    const tokenAddress = (item.entity === 'account' || item.entity === 'tx' || item.entity === 'mempool-tx') ? item.tokenAddress : undefined
    const token = tokenAddress ? tokens?.find(t => compareAddress(t.address, tokenAddress)) : undefined
    const decimals = token?.numberOfDecimals ?? 8
    const smallUnit = token?.smallestUnitName ?? ''

    switch (item.entity) {
        case 'account':
            title = shortenAddress(item.address || "")
            const balance = formatWei(item.balance, decimals)
            subtitle = m.search_balance({ balance: balance, unit: smallUnit })
            break
        case 'tx':
            title = shortenAddress(item.hash || "")
            if (item.type === 'TRANSFER') {
                subtitle = `${formatTransferType(item.type)} · ${formatWei(item.amount, decimals)} ${smallUnit}`
            } else {
                subtitle = formatTransferType(item.type)
            }
            break
        case 'mempool-tx':
            title = shortenAddress(item.hash || "")
            if (item.transferType === 'TRANSFER') {
                subtitle = `${formatTransferType(item.transferType)} · ${formatWei(item.amount, decimals)} ${smallUnit} (${m.common_pending()})`
            } else {
                subtitle = `${formatTransferType(item.transferType)} (${m.common_pending()})`
            }
            break
        case 'block':
            title = shortenAddress(item.hash || "")
            subtitle = m.search_height({ height: formatNum(item.height) })
            break
        case 'token':
            title = item.name || ""
            subtitle = shortenAddress(item.address || "")
            break
        case 'validator':
            title = shortenAddress(item.address || "")
            subtitle = m.search_validator()
            break
        case 'authority':
            title = shortenAddress(item.address || "")
            subtitle = m.search_authority()
            break
        case 'address-alias':
            title = item.alias || ""
            subtitle = m.search_address({ address: shortenAddress(item.address || "") })
            break
    }

    const renderIcon = () => {
        if (item.entity === 'token' && item?.logoUrl) {
            return <AvatarImage src={item.logoUrl} alt={item.name} />
        }
        if (item.entity === 'account' && token && token?.logoUrl) {
            return <AvatarImage src={token.logoUrl} alt={token.name} />
        }
        return null
    }

    const typeLabel = (() => {
        switch (item.entity) {
            case 'account': return m.common_account()
            case 'tx': return m.tx_detail_title()
            case 'mempool-tx': return m.header_mempool()
            case 'block': return m.block_detail_block()
            case 'token': return m.common_token()
            case 'validator': return m.search_validator()
            case 'authority': return m.search_authority()
            case 'address-alias': return "Alias"
        }
    })()

    return (
        <div className="flex items-center gap-3 w-full">
            <Avatar size="sm">
                {renderIcon()}
                <AvatarFallback>
                    <Icon className="size-4" />
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{title}</span>
                    <Badge variant="secondary" className="text-[10px] h-[18px] px-1.5 font-normal">{typeLabel}</Badge>
                </div>
                <span className="text-xs text-muted-foreground truncate">{subtitle}</span>
            </div>
        </div>
    )
}

export function SearchInput({ className, placeholder }: SearchInputProps) {
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearchValue = useDebounce(searchValue, 300);
    const [navigateOnLoad, setNavigateOnLoad] = useState(false);

    const { data: searchResults, isLoading, isError } = useSearchResult(debouncedSearchValue)

    const isSearching = (searchValue.length > 0 && searchValue !== debouncedSearchValue) || (isLoading && !!debouncedSearchValue);

    const allItems = useMemo<Item[]>(() => {
        if (!searchResults) return []
        return [
            ...(searchResults.accounts || []).map(i => ({ ...i, entity: 'account' as const })),
            ...(searchResults.transactions || []).map(i => ({ ...i, entity: 'tx' as const })),
            ...(searchResults.mempoolTransactions || []).map(i => ({ ...i, entity: 'mempool-tx' as const })),
            ...(searchResults.blocks || []).map(i => ({ ...i, entity: 'block' as const })),
            ...(searchResults.tokens || []).map(i => ({ ...i, entity: 'token' as const })),
            ...(searchResults.validators || []).map(i => ({ ...i, entity: 'validator' as const })),
            ...(searchResults.authorities || []).map(i => ({ ...i, entity: 'authority' as const })),
            //...(searchResults.aliases || []).map(i => ({ ...i, entity: 'address-alias' as const })),
        ]
    }, [searchResults])

    const results = useMemo(() => {
        if (allItems.length === 0) {
            return []
        }
        return [
            {
                value: m.search_group_accounts(),
                items: allItems.filter(i => i.entity === 'account'),
            },
            {
                value: m.search_group_transactions(),
                items: allItems.filter(i => i.entity === 'tx'),
            },
            {
                value: m.search_group_mempool(),
                items: allItems.filter(i => i.entity === 'mempool-tx'),
            },
            {
                value: m.search_group_blocks(),
                items: allItems.filter(i => i.entity === 'block'),
            },
            {
                value: m.search_group_tokens(),
                items: allItems.filter(i => i.entity === 'token'),
            },
            {
                value: m.search_group_validators(),
                items: allItems.filter(i => i.entity === 'validator'),
            },
            {
                value: m.search_group_authorities(),
                items: allItems.filter(i => i.entity === 'authority'),
            },
            // {
            //     value: "Address aliases",
            //     items: allItems.filter(i => i.entity === 'address-alias'),
            // },
        ].filter(group => group.items.length > 0)
    }, [allItems])

    function getStatus(): React.ReactNode | null {
        if (isSearching) {
            return (
                <>
                    <Spinner />
                    {m.search_searching()}
                </>
            );
        }

        if (isError) {
            return "Failed to fetch search results";
        }

        if (searchValue === '') {
            return null;
        }

        // Only explicitly show "No results" if we've searched (debounced value exists) and came back empty
        if (debouncedSearchValue && searchResults && allItems.length === 0 && !isLoading) {
            return m.search_no_results();
        }
        return null
    }

    const status = getStatus();

    const handleSubmit = useCallback((item: Item) => {
        switch (item.entity) {
            case 'account':
                navigate({
                    to: `/account/$address`,
                    params: {
                        address: item.address || "",
                    }
                })
                break
            case 'tx':
                navigate({
                    to: `/tx/$hash`,
                    params: {
                        hash: item.hash || "",
                    }
                })
                break
            case 'mempool-tx':
                navigate({
                    to: `/tx/$hash`,
                    params: {
                        hash: item.hash || "",
                    }
                })
                break
            case 'block':
                navigate({
                    to: `/block/$hash`,
                    params: {
                        hash: item.hash || "",
                    }
                })
                break
            case 'token':
                navigate({
                    to: `/token/$address`,
                    params: {
                        address: item.address || "",
                    }
                })
                break
            case 'validator':
                navigate({
                    to: `/account/$address`,
                    params: {
                        address: item.address || "",
                    }
                })
                break
            case 'authority':
                navigate({
                    to: `/account/$address`,
                    params: {
                        address: item.address || "",
                    }
                })
                break
            case 'address-alias':
                break
        }
    }, [navigate]);

    useEffect(() => {
        if (navigateOnLoad) {
            if (searchValue === debouncedSearchValue && !isLoading) {
                if (!isError && allItems.length > 0) {
                    handleSubmit(allItems[0]);
                }
                setNavigateOnLoad(false);
            }
        }
    }, [navigateOnLoad, searchValue, debouncedSearchValue, isLoading, isError, allItems, handleSubmit]);

    return (
        <Autocomplete
            items={results}
            value={searchValue}
            onValueChange={(nextSearchValue) => {
                const selectedItem = allItems.find(i => toValue(i) === nextSearchValue);
                if (selectedItem) {
                    handleSubmit(selectedItem);
                    return;
                }
                setSearchValue(nextSearchValue);
            }}
            itemToStringValue={toStr as any}
            filter={null}
        >
            <AutocompleteInput
                icon={<Search className="size-5!" />}
                placeholder={placeholder}
                className={className}
                showTrigger={false}
                addon={isSearching ? <div className="pr-3 flex items-center justify-center"><Spinner className="size-4 text-muted-foreground" /></div> : null}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        // Check if user is navigating the popup list with keyboard
                        const isMenuSelecting = document.querySelector('[data-highlighted]');
                        if (isMenuSelecting) return;

                        e.preventDefault();
                        if (searchValue.trim().length === 0) return;

                        // We set navigateOnLoad to true, and let the useEffect handle awaiting debounce and loading
                        setNavigateOnLoad(true);
                    }
                }}
            />
            <AutocompleteContent alignOffset={-24}>
                <AutocompleteStatus>
                    {status && (
                        <div className="flex items-center gap-2 py-1 pl-4 pr-8 text-sm">
                            {status}
                        </div>
                    )}
                </AutocompleteStatus>
                <AutocompleteEmpty>{m.table_no_results()}</AutocompleteEmpty>
                <AutocompleteList>
                    {(group, index) => (
                        <AutocompleteGroup key={group.value} items={group.items}>
                            <AutocompleteLabel>{group.value}</AutocompleteLabel>
                            <AutocompleteCollection>
                                {(item: Item) => (
                                    <AutocompleteItem key={toValue(item)} value={toValue(item)} className="cursor-pointer" onClick={(e) => {
                                        e.preventDefault();
                                        handleSubmit(item);
                                    }}>
                                        <ItemContent item={item} />
                                    </AutocompleteItem>
                                )}
                            </AutocompleteCollection>
                            {(index < results.length - 1) && <AutocompleteSeparator />}
                        </AutocompleteGroup>
                    )}
                </AutocompleteList>
            </AutocompleteContent>
        </Autocomplete>
    )
}