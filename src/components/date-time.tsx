import React, { useState, useEffect } from 'react';
import { formatTimestampServer, formatTimestampClient } from '@/lib/date-utils';
import { getLocale } from '@/paraglide/runtime';
import { cn } from '@/lib/utils';

interface DateTimeProps {
    timestamp: string | undefined | null;
    mode?: 'table' | 'detail';
    locale?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const DateTime: React.FC<DateTimeProps> = ({
    timestamp,
    mode = 'table',
    locale = getLocale(),
    className,
    style
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [, setTick] = useState(0);

    useEffect(() => {
        setIsMounted(true);
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    if (!timestamp) return <span className={className} style={style} title='N/A'>—</span>;

    const displayValue = isMounted
        ? formatTimestampClient(timestamp, mode, locale)
        : formatTimestampServer(timestamp, mode, locale || 'en-US');

    return (
        <span
            className={cn('inline-flex items-center gap-1', className)}
            style={style}
            title={new Date(timestamp).toISOString()}
        >
            {displayValue}
        </span>
    );
};