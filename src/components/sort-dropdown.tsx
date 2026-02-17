import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import * as m from "@/paraglide/messages"

export type SortDirection = 'ASC' | 'DESC'

interface SortDropdownProps {
    value: SortDirection
    onValueChange: (value: SortDirection) => void
    className?: string
    /** Custom label for DESC (e.g. "Newest", "Highest") */
    descLabel?: string
    /** Custom label for ASC (e.g. "Oldest", "Lowest") */
    ascLabel?: string
}

export function SortDropdown({
    value,
    onValueChange,
    className,
    descLabel,
    ascLabel
}: SortDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className={cn("h-8 gap-2", className)}>
                    {value === 'DESC' ? (
                        <ArrowDownNarrowWide className="h-3.5 w-3.5 opacity-70" />
                    ) : (
                        <ArrowUpWideNarrow className="h-3.5 w-3.5 opacity-70" />
                    )}
                    <span className="text-xs font-medium">
                        {value === 'DESC' ? (descLabel ?? m.sort_newest()) : (ascLabel ?? m.sort_oldest())}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            } />
            <DropdownMenuContent align="end" className="w-[140px]">
                <DropdownMenuRadioGroup value={value} onValueChange={(val) => onValueChange(val as SortDirection)}>
                    <DropdownMenuRadioItem value="DESC" className="text-xs">
                        {descLabel ?? m.sort_newest()}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ASC" className="text-xs">
                        {ascLabel ?? m.sort_oldest()}
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
