const getStaticFormatter = (locale: string) =>
    new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
    });

const getFullFormatter = (locale: string) =>
    new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'UTC',
    });

export const formatTimestampServer = (
    timestamp: string | undefined,
    mode: 'table' | 'detail' = 'table',
    locale: string = 'en-US'
): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);

    if (mode === 'detail') {
        return `${getFullFormatter(locale).format(date)} UTC`;
    }

    return getStaticFormatter(locale).format(date);
};

export const formatTimestampClient = (
    timestamp: string | undefined,
    mode: 'table' | 'detail' = 'table',
    locale: string = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
): string => {
    if (!timestamp) return 'Unknown';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    const diffInDays = Math.abs(Math.floor(diffInSeconds / 86400));

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });

    const getRelativeText = () => {
        const absSec = Math.abs(diffInSeconds);
        if (absSec < 60) return rtf.format(Math.floor(diffInSeconds), 'second');
        if (absSec < 3600) return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
        if (absSec < 86400) return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
        return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
    };

    const staticPart = getStaticFormatter(locale).format(date);

    if (mode === 'detail') {
        const fullTime = getFullFormatter(locale).format(date);
        return `${getRelativeText()} (${fullTime} UTC)`;
    }
    return diffInDays < 7 ? getRelativeText() : staticPart;
};