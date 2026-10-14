// Dates and times. The rule: relative under seven days ("6 min ago"), an absolute date after that,
// both in the viewer's locale and time zone, with the exact date, time and time zone in a tooltip.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export type DateInput = Date | string | number;

export function toDate(value: DateInput): Date {
	return value instanceof Date ? value : new Date(value);
}

/** How long ago, compact: `6 min`, `3 h`, `12 days`. Under a minute is `<1 min`. */
export function formatAge(since: DateInput, now: DateInput = Date.now()): string {
	const ms = Math.max(0, toDate(now).getTime() - toDate(since).getTime());
	if (ms < MINUTE) return '<1 min';
	if (ms < HOUR) return `${Math.floor(ms / MINUTE)} min`;
	if (ms < DAY) return `${Math.floor(ms / HOUR)} h`;
	const days = Math.floor(ms / DAY);
	return `${days} ${days === 1 ? 'day' : 'days'}`;
}

/** `just now`, `6 min ago`, `3 h ago`, `2 days ago`; from seven days, an absolute date. */
export function formatRelative(
	at: DateInput,
	now: DateInput = Date.now(),
	locale?: string,
	timeZone?: string
): string {
	const ms = toDate(now).getTime() - toDate(at).getTime();
	if (ms < MINUTE && ms > -MINUTE) return 'just now';
	if (ms > 0 && ms < 7 * DAY) return `${formatAge(at, now)} ago`;
	const date = toDate(at);
	const sameYear = date.getFullYear() === toDate(now).getFullYear();
	return new Intl.DateTimeFormat(locale, {
		month: 'short',
		day: 'numeric',
		...(sameYear ? {} : { year: 'numeric' }),
		timeZone
	}).format(date);
}

/** The exact value, for a tooltip: date, time and time zone in the viewer's locale. */
export function formatExact(at: DateInput, locale?: string, timeZone?: string): string {
	return (
		new Intl.DateTimeFormat(locale, {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone
		}).format(toDate(at)) + ` ${zoneName(at, locale, timeZone)}`
	);
}

function zoneName(at: DateInput, locale?: string, timeZone?: string): string {
	const parts = new Intl.DateTimeFormat(locale, { timeZoneName: 'short', timeZone }).formatToParts(
		toDate(at)
	);
	return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
}
