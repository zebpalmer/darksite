import { describe, expect, it } from 'vitest';
import { createLabels, humanize } from './labels.js';
import { formatCompact, formatMoney, formatNumber } from './numbers.js';

describe('numbers', () => {
	it('separates thousands in the locale', () => {
		expect(formatNumber(12408, { locale: 'en-US' })).toBe('12,408');
		expect(formatNumber(12408.256, { locale: 'en-US' })).toBe('12,408.26');
	});

	it('compacts only to one decimal', () => {
		expect(formatCompact(12408, 'en-US')).toBe('12.4K');
		expect(formatCompact(1_250_000, 'en-US')).toBe('1.3M');
		expect(formatCompact(950, 'en-US')).toBe('950');
	});

	it('formats money in major units, with sub-cent precision on request', () => {
		expect(formatMoney(1234.5, 'USD', { locale: 'en-US' })).toBe('$1,234.50');
		expect(formatMoney(0.0025, 'USD', { locale: 'en-US', maximumFractionDigits: 4 })).toBe(
			'$0.0025'
		);
	});
});

describe('labels', () => {
	it('humanizes codes', () => {
		expect(humanize('missing_start_date')).toBe('Missing start date');
		expect(humanize('inProgress')).toBe('In progress');
		expect(humanize('on-hold')).toBe('On hold');
	});

	it('labels through one map, falling back to words, and leaves a missing value empty', () => {
		const status = createLabels({ in_progress: 'In progress', on_hold: 'On hold' });
		expect(status.label('on_hold')).toBe('On hold');
		expect(status.label('awaiting_review')).toBe('Awaiting review');
		expect(status.label(null)).toBe('');
		expect(status.has('on_hold')).toBe(true);
		expect(status.has('awaiting_review')).toBe(false);
	});
});
