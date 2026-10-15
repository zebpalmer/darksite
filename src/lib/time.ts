// Dates and times. The rule: relative under seven days ("6 min ago"), an absolute date after that,
// both in the viewer's locale and time zone, with the exact date, time and time zone in a tooltip.
//
// Two kinds of value come in. A **timestamp** is an instant (`Date`, epoch milliseconds, or an ISO
// string with a time). A **calendar date** is a day with no time or zone (`'2026-10-01'`): a due
// date, a start date. JavaScript parses a bare `YYYY-MM-DD` as UTC midnight, which shows the day
// before anywhere west of UTC; every function here reads it as that day wherever the viewer is.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export type DateInput = Date | string | number;

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a bare calendar date string, `YYYY-MM-DD`, with no time or zone. */
export function isCalendarDate(value: unknown): value is string {
	return typeof value === 'string' && CALENDAR_DATE.test(value.trim());
}

/**
 * A `Date` for any input. A calendar date (`'2026-10-01'`) becomes local midnight of that day, not
 * UTC midnight, so it never lands on the previous day west of UTC.
 */
export function toDate(value: DateInput): Date {
	if (value instanceof Date) return value;
	if (isCalendarDate(value)) {
		const [y, m, d] = calendarParts(value);
		return new Date(y, m - 1, d);
	}
	return new Date(value);
}

function calendarParts(value: string): [number, number, number] {
	const [, y, m, d] = CALENDAR_DATE.exec(value.trim())!;
	return [Number(y), Number(m), Number(d)];
}

/** Year, month and day of an instant as seen in `timeZone` (the viewer's by default). */
function partsIn(date: Date, timeZone?: string): [number, number, number] {
	const parts = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		timeZone
	}).formatToParts(date);
	const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
	return [get('year'), get('month'), get('day')];
}

/** The calendar day of any input, as a UTC-midnight `Date` that is only ever formatted in UTC. */
function dayOf(value: DateInput, timeZone?: string): Date {
	const [y, m, d] = isCalendarDate(value) ? calendarParts(value) : partsIn(toDate(value), timeZone);
	return new Date(Date.UTC(y, m - 1, d));
}

export interface DateOptions {
	locale?: string;
	/** For a timestamp: the zone whose calendar day is shown. Ignored for a calendar date. */
	timeZone?: string;
	/** `auto` (default): the year only when it is not this year. `always`: every time. */
	year?: 'auto' | 'always';
	/** What "this year" is measured against; defaults to now. */
	now?: DateInput;
}

/**
 * A date with no time: `Oct 1`, or `Oct 1, 2025` when it is not this year (`year: 'always'` shows
 * it every time). A calendar date (`'2026-10-01'`) is shown as exactly that day in every time
 * zone; a timestamp shows its day in the viewer's zone (or `timeZone`).
 */
export function formatDate(value: DateInput, options: DateOptions = {}): string {
	const day = dayOf(value, options.timeZone);
	const thisYear = dayOf(options.now ?? Date.now(), options.timeZone).getUTCFullYear();
	const showYear = options.year === 'always' || day.getUTCFullYear() !== thisYear;
	return new Intl.DateTimeFormat(options.locale, {
		month: 'short',
		day: 'numeric',
		...(showYear ? { year: 'numeric' } : {}),
		timeZone: 'UTC'
	}).format(day);
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

/**
 * `just now`, `6 min ago`, `3 h ago`, `2 days ago`; from seven days, an absolute date (`formatDate`).
 * A calendar date counts whole days instead: `today`, `1 day ago` … `6 days ago`, then its date. A
 * future value shows its date.
 */
export function formatRelative(
	at: DateInput,
	now: DateInput = Date.now(),
	locale?: string,
	timeZone?: string
): string {
	if (isCalendarDate(at)) {
		const days = Math.round((dayOf(now, timeZone).getTime() - dayOf(at).getTime()) / DAY);
		if (days === 0) return 'today';
		if (days > 0 && days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
		return formatDate(at, { locale, timeZone, now });
	}
	const ms = toDate(now).getTime() - toDate(at).getTime();
	if (ms < MINUTE && ms > -MINUTE) return 'just now';
	if (ms > 0 && ms < 7 * DAY) return `${formatAge(at, now)} ago`;
	return formatDate(at, { locale, timeZone, now });
}

/**
 * The exact value, for a tooltip: date, time and time zone in the viewer's locale. A calendar date
 * has no time or zone, so it is the full date alone (`Oct 1, 2026`).
 */
export function formatExact(at: DateInput, locale?: string, timeZone?: string): string {
	if (isCalendarDate(at)) return formatDate(at, { locale, year: 'always' });
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
