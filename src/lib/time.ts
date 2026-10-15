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

/** A length of time in seconds as a clock: `42` → `0:42`, `3725` → `1:02:05`. */
export function formatDuration(seconds: number | null | undefined): string {
	if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0)
		return '';
	const total = Math.round(seconds);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = String(total % 60).padStart(2, '0');
	return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/**
 * Time remaining, as a countdown clock: `42_000` → `0:42`, `3_725_000` → `1:02:05`. Takes
 * milliseconds and rounds **up** to the second, so the clock reads `0:01` until the time is truly
 * up and `0:00` only at the end. A negative or missing value reads `0:00`.
 */
export function formatCountdown(remainingMs: number | null | undefined): string {
	const ms =
		remainingMs === null || remainingMs === undefined || !Number.isFinite(remainingMs)
			? 0
			: Math.max(0, remainingMs);
	return formatDuration(Math.ceil(ms / 1000));
}

/** A day as local midnight; a bare `YYYY-MM-DD` is that day, never UTC midnight. */
function localDay(value: DateInput): Date {
	if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
		const [y, m, d] = value.trim().split('-').map(Number);
		return new Date(y, m - 1, d);
	}
	return toDate(value);
}

/**
 * Whole calendar days from `now` to `due`, in the viewer's time zone: `0` on the day, `3` three
 * days ahead, `-2` two days past. A bare `YYYY-MM-DD` counts as that day.
 */
export function daysUntil(due: DateInput, now: DateInput = Date.now()): number {
	const day = (value: DateInput) => {
		const d = localDay(value);
		return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
	};
	return Math.round((day(due) - day(now)) / DAY);
}

/** Against a due date: `in 3 days`, `in 1 day`, `due today`, `1 day overdue`, `2 days overdue`. */
export function formatDue(due: DateInput, now: DateInput = Date.now()): string {
	const n = daysUntil(due, now);
	const days = (k: number) => `${k} ${k === 1 ? 'day' : 'days'}`;
	if (n === 0) return 'due today';
	return n > 0 ? `in ${days(n)}` : `${days(-n)} overdue`;
}

/** The exact due date for a tooltip: a bare date is the date alone, a timestamp `formatExact`. */
export function formatDueExact(due: DateInput, locale?: string): string {
	return typeof due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(due.trim())
		? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(localDay(due))
		: formatExact(due, locale);
}
