import { useTokens } from "./useTokens"
import { useMemo } from "react"
import { compareAddress, formatWei as formatWeiUtil } from "@/lib/utils"
import { NATIVE_TOKEN, DECIMALS } from "@goldenera/cryptoj"

export interface UseTokenUtilProps {
    tokenAddress?: string
}

export const useTokenUtil = ({ tokenAddress }: UseTokenUtilProps = {}) => {
    const { data: tokens } = useTokens()

    return useMemo(() => {
        const token = tokens?.find(t => compareAddress(t.address, tokenAddress ?? NATIVE_TOKEN))
        const decimals = token?.numberOfDecimals ?? DECIMALS.STANDARD
        const symbol = token?.smallestUnitName ?? ''
        const website = token?.websiteUrl ?? null
        const logoUrl = token?.logoUrl ?? null

        const formatWei = (value?: bigint | string, withSymbol: boolean = true) => {
            if (value === undefined || value === null) return '-'
            const wei = formatWeiUtil(value.toString(), decimals)
            return `${wei}${withSymbol ? ` ${symbol}` : ''}`
        }

        return {
            token,
            decimals,
            symbol,
            website,
            logoUrl,
            formatWei,
        }
    }, [tokens, tokenAddress])
}