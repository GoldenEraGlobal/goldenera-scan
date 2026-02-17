import * as React from 'react';
import { createLink, LinkComponent } from '@tanstack/react-router';
import { shortenAddress, isNullAddress, isZeroHash, cn, compareAddress, isNativeToken } from "@/lib/utils";
import { CopyButton } from '@/components/ui/copy-button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTokens } from '@/hooks/useTokens';

// =============================================================================
// AppLink - Type-safe global link component
// =============================================================================

interface AppLinkBaseProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    /** Whether the link should be disabled/non-clickable */
    disabled?: boolean;
}

const AppLinkBase = React.forwardRef<HTMLAnchorElement, AppLinkBaseProps>(
    ({ disabled, className, children, ...props }, ref) => {
        if (disabled) {
            return (
                <span
                    ref={ref as any}
                    className={cn("text-muted-foreground/50", className)}
                    {...(props as React.HTMLAttributes<HTMLSpanElement>)}
                >
                    {children}
                </span>
            );
        }

        return (
            <a
                ref={ref}
                {...props}
                className={cn("text-primary hover:underline", className)}
            >
                {children}
            </a>
        );
    }
);

AppLinkBase.displayName = 'AppLinkBase';

const CreatedAppLink = createLink(AppLinkBase);

/**
 * Type-safe global link component for the entire app
 * Uses @tanstack/react-router for type-safe routing
 */
export const AppLink: LinkComponent<typeof AppLinkBase> = (props) => {
    return <CreatedAppLink preload="intent" {...props} />;
};

// =============================================================================
// AddressLink - Link component for blockchain addresses
// =============================================================================

interface AddressLinkProps {
    /** The full address */
    address: string | null | undefined;
    /** Number of characters to show at the start (default: 6) */
    startChars?: number;
    /** Number of characters to show at the end (default: 4) */
    endChars?: number;
    /** Additional CSS classes */
    className?: string;
    /** Type of address (default: 'account') */
    type?: 'token' | 'account'
    /** Disable the link */
    disabled?: boolean;
}

/**
 * Link component for blockchain addresses
 * Automatically shortens the address and disables null addresses
 */
export function AddressLink({
    address,
    startChars = 6,
    endChars = 4,
    className,
    type = 'account',
    disabled,
}: AddressLinkProps) {
    const isNull = isNullAddress(address);
    const isDisabled = disabled || (isNull && type === 'account');
    const shortened = shortenAddress(address, startChars, endChars);
    const { data: tokens } = useTokens();
    const token = type === 'token' ? tokens?.find((t) => compareAddress(t.address, address)) : null;
    const isNative = type === 'token' && !!token && isNativeToken(token?.address);

    if (!address) {
        return <span className={cn("text-muted-foreground/50", className)}>—</span>;
    }

    return (
        <span className="inline-flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger
                    render={
                        <AppLink
                            to={type === 'token' ? '/token/$address' : '/account/$address'}
                            params={{ address }}
                            disabled={isDisabled}
                            className={cn("font-mono", className)}
                        />
                    }
                >
                    {shortened} {!!token ? `(${token.smallestUnitName}) ${isNative ? '(native)' : ''}` : ''}
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm break-all">
                    <span className="text-xs font-mono">{address}</span>
                </TooltipContent>
            </Tooltip>
            <CopyButton value={address} />
        </span>
    );
}

// =============================================================================
// HashLink - Link component for transaction/block hashes
// =============================================================================

interface HashLinkProps {
    /** The full hash (transaction hash, block hash, etc.) */
    hash: string | null | undefined;
    /** Type of hash - determines the URL path */
    type: 'tx' | 'block' | 'unknown';
    /** Number of characters to show at the start (default: 8) */
    startChars?: number;
    /** Number of characters to show at the end (default: 6) */
    endChars?: number;
    /** Additional CSS classes */
    className?: string;
    /** Disable the link */
    disabled?: boolean;
}

/**
 * Link component for hashes (transaction hashes, block hashes)
 * Automatically shortens the hash
 */
export function HashLink({
    hash,
    type = 'block',
    startChars = 8,
    endChars = 6,
    className,
    disabled,
}: HashLinkProps) {
    const shortened = shortenAddress(hash, startChars, endChars);
    const isDisabled = disabled || isZeroHash(hash);

    if (!hash) {
        return <span className={cn("text-muted-foreground/50", className)}>—</span>;
    }

    const linkProps = type === 'unknown'
        ? { to: '/' as const, params: {} }
        : type === 'tx'
            ? { to: '/tx/$hash' as const, params: { hash } }
            : { to: '/block/$hash' as const, params: { hash } };

    return (
        <span className="inline-flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger
                    render={<AppLink {...linkProps} disabled={isDisabled} className={cn("font-mono", className)} />}
                >
                    {shortened}
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm break-all">
                    <span className="text-xs font-mono">{hash}</span>
                </TooltipContent>
            </Tooltip>
            <CopyButton value={hash} />
        </span>
    );
}
