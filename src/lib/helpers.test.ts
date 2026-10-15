import { describe, expect, it } from 'vitest';
import { countActive, filtersFromParams, filtersToParams, type FilterSection } from './filters.js';
import { SEVERITIES, severityLabel, severityRank } from './severity.js';
import {
	daysUntil,
	formatAge,
	formatDate,
	formatDue,
	formatExact,
	formatRelative,
	isCalendarDate
} from './time.js';

const now = new Date('2026-10-14T12:00:00Z');
const ago = (ms: number) => new Date(now.getTime() - ms);

describe('time', () => {
	it('formats an age compactly', () => {
		expect(formatAge(ago(30_000), now)).toBe('<1 min');
		expect(formatAge(ago(6 * 60_000), now)).toBe('6 min');
		expect(formatAge(ago(3 * 3_600_000), now)).toBe('3 h');
		expect(formatAge(ago(86_400_000), now)).toBe('1 day');
		expect(formatAge(ago(12 * 86_400_000), now)).toBe('12 days');
	});

	it('is relative under seven days and absolute after', () => {
		expect(formatRelative(ago(10_000), now)).toBe('just now');
		expect(formatRelative(ago(6 * 60_000), now)).toBe('6 min ago');
		expect(formatRelative(ago(2 * 86_400_000), now)).toBe('2 days ago');
		expect(formatRelative(ago(9 * 86_400_000), now, 'en-US', 'UTC')).toBe('Oct 5');
		expect(formatRelative(new Date('2025-03-01T00:00:00Z'), now, 'en-US', 'UTC')).toBe(
			'Mar 1, 2025'
		);
	});
});

describe('calendar dates', () => {
	// A bare YYYY-MM-DD is a day, not UTC midnight: it must read as that day in every zone.
	const west = { locale: 'en-US', timeZone: 'America/Los_Angeles', now };

	it('recognizes a bare calendar date and nothing else', () => {
		expect(isCalendarDate('2026-10-01')).toBe(true);
		expect(isCalendarDate('2026-10-01T00:00:00Z')).toBe(false);
		expect(isCalendarDate(new Date())).toBe(false);
		expect(isCalendarDate(1_700_000_000_000)).toBe(false);
	});

	it('formats a calendar date as exactly that day, west of UTC too', () => {
		expect(formatDate('2026-10-01', west)).toBe('Oct 1');
		expect(formatDate('2026-10-01', { ...west, timeZone: 'Pacific/Honolulu' })).toBe('Oct 1');
		expect(formatDate('2026-01-01', { ...west, timeZone: 'Asia/Tokyo' })).toBe('Jan 1');
	});

	it('shows the year only when it is not this year, or always on request', () => {
		expect(formatDate('2025-12-31', west)).toBe('Dec 31, 2025');
		expect(formatDate('2027-02-01', west)).toBe('Feb 1, 2027');
		expect(formatDate('2026-10-01', { ...west, year: 'always' })).toBe('Oct 1, 2026');
	});

	it("formats a timestamp's day in the viewer's zone", () => {
		// 02:00 UTC on Oct 2 is still Oct 1 in Los Angeles.
		expect(formatDate('2026-10-02T02:00:00Z', west)).toBe('Oct 1');
		expect(formatDate('2026-10-02T02:00:00Z', { ...west, timeZone: 'UTC' })).toBe('Oct 2');
	});

	it('counts whole days for a calendar date in formatRelative', () => {
		expect(formatRelative('2026-10-14', now, 'en-US', 'UTC')).toBe('today');
		expect(formatRelative('2026-10-13', now, 'en-US', 'UTC')).toBe('1 day ago');
		expect(formatRelative('2026-10-08', now, 'en-US', 'UTC')).toBe('6 days ago');
		expect(formatRelative('2026-10-07', now, 'en-US', 'UTC')).toBe('Oct 7');
		expect(formatRelative('2026-10-20', now, 'en-US', 'UTC')).toBe('Oct 20');
		// In Los Angeles it is still Oct 14 at 05:00, so Oct 14 is today there as well.
		expect(formatRelative('2026-10-14', now, 'en-US', 'America/Los_Angeles')).toBe('today');
	});

	it('gives a calendar date its full date, with no time or zone, in formatExact', () => {
		expect(formatExact('2026-10-01', 'en-US', 'America/Los_Angeles')).toBe('Oct 1, 2026');
	});

	it('ages a calendar date from local midnight of that day', () => {
		expect(formatAge('2026-10-02', new Date(2026, 9, 14, 12))).toBe('12 days');
	});
});

describe('severity', () => {
	it('has one order and names', () => {
		expect(SEVERITIES).toEqual(['info', 'low', 'medium', 'high', 'critical']);
		expect(severityLabel('high')).toBe('High');
		expect(severityRank('critical')).toBe(5);
	});
});

describe('filters', () => {
	const sections: FilterSection[] = [
		{
			key: 'status',
			label: 'Status',
			options: [
				{ value: 'ready', label: 'Ready' },
				{ value: 'hold', label: 'On hold' }
			]
		},
		{
			key: 'owner',
			label: 'Owner',
			multiple: false,
			options: [
				{ value: 'a', label: 'A' },
				{ value: 'b', label: 'B' }
			]
		}
	];

	it('round-trips through search params and keeps other params', () => {
		const params = filtersToParams(
			{ status: ['ready', 'hold'], owner: ['b'] },
			sections,
			'q=alpha'
		);
		expect(params.toString()).toBe('q=alpha&status=ready&status=hold&owner=b');
		expect(filtersFromParams(params, sections)).toEqual({
			status: ['ready', 'hold'],
			owner: ['b']
		});
	});

	it('drops unknown values and keeps one value for a single-choice section', () => {
		expect(filtersFromParams('status=nope&owner=a&owner=b', sections)).toEqual({ owner: ['a'] });
	});

	it('counts active filters', () => {
		expect(countActive({ status: ['ready', 'hold'], owner: ['a'] })).toBe(3);
		expect(countActive({})).toBe(0);
	});
});

describe('due dates', () => {
	it('counts whole local days to a due date, a bare date being that day', () => {
		const now = new Date(2026, 9, 14, 23, 30);
		expect(daysUntil('2026-10-14', now)).toBe(0);
		expect(daysUntil('2026-10-15', now)).toBe(1);
		expect(daysUntil(new Date(2026, 9, 15, 0, 10), now)).toBe(1);
		expect(daysUntil('2026-10-11', now)).toBe(-3);
		expect(formatDue('2026-10-20', now)).toBe('in 6 days');
		expect(formatDue('2026-10-14', now)).toBe('due today');
		expect(formatDue('2026-10-13', now)).toBe('1 day overdue');
	});
});
