import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import * as m from "@/paraglide/messages"

interface CopyButtonProps {
    /** The text to copy to clipboard */
    value: string
    /** Size variant */
    size?: 'sm' | 'md'
    /** Additional CSS classes */
    className?: string
}

export function CopyButton({ value, size = 'sm', className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // fallback
        }
    }, [value])

    const iconClass = size === 'md' ? 'h-4 w-4' : 'h-3 w-3'

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <button
                        type="button"
                        onClick={handleCopy}
                        className={cn(
                            'inline-flex items-center justify-center shrink-0 rounded',
                            size === 'md' ? 'p-1' : 'p-0.5',
                            'text-muted-foreground/60 hover:text-foreground',
                            'transition-colors cursor-pointer',
                            className
                        )}
                    />
                }
            >
                <span className="sr-only">Copy {value}</span>
                {copied ? (
                    <Check className={cn(iconClass, 'text-success')} />
                ) : (
                    <Copy className={iconClass} />
                )}
            </TooltipTrigger>
            <TooltipContent side="top">
                {copied ? m.common_copied() : m.common_copy()}
            </TooltipContent>
        </Tooltip>
    )
}
