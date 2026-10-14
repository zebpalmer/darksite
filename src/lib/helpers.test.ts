import { describe, expect, it } from 'vitest';
import { countActive, filtersFromParams, filtersToParams, type FilterSection } from './filters.js';
import { SEVERITIES, severityLabel, severityRank } from './severity.js';
import { formatAge, formatRelative } from './time.js';

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
