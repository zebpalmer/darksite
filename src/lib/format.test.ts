import { describe, expect, it } from 'vitest';
import { createLabels, humanize, initials } from './labels.js';
import { formatCompact, formatConfidence, formatMoney, formatNumber } from './numbers.js';
import { formatCountdown } from './time.js';

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

	it('takes whole units from one option, whatever the currency default', () => {
		expect(formatMoney(1234.5, 'USD', { locale: 'en-US', maximumFractionDigits: 0 })).toBe(
			'$1,235'
		);
		expect(formatMoney(1234, 'USD', { locale: 'en-US', minimumFractionDigits: 3 })).toBe(
			'$1,234.000'
		);
		// A contradictory pair is fitted, not thrown.
		expect(
			formatMoney(1234.5, 'USD', {
				locale: 'en-US',
				minimumFractionDigits: 2,
				maximumFractionDigits: 0
			})
		).toBe('$1,235');
		expect(formatMoney(1234, 'JPY', { locale: 'en-US', maximumFractionDigits: 0 })).toBe('¥1,234');
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

describe('formatConfidence', () => {
	it('is a whole percentage that never overstates the ends', () => {
		expect(formatConfidence(0.873)).toBe('87%');
		expect(formatConfidence(1)).toBe('100%');
		expect(formatConfidence(0.997)).toBe('99%');
		expect(formatConfidence(0)).toBe('0%');
		expect(formatConfidence(0.003)).toBe('<1%');
		expect(formatConfidence(1.4)).toBe('100%');
		expect(formatConfidence(null)).toBe('');
		expect(formatConfidence(Number.NaN)).toBe('');
	});
});

describe('formatCountdown', () => {
	it('counts down in m:ss or h:mm:ss, rounding up to the second', () => {
		expect(formatCountdown(42_000)).toBe('0:42');
		expect(formatCountdown(41_200)).toBe('0:42');
		expect(formatCountdown(1)).toBe('0:01');
		expect(formatCountdown(0)).toBe('0:00');
		expect(formatCountdown(-500)).toBe('0:00');
		expect(formatCountdown(3_725_000)).toBe('1:02:05');
		expect(formatCountdown(null)).toBe('0:00');
	});
});

describe('initials', () => {
	it('takes the first letter of the first two words', () => {
		expect(initials('A. Rivera')).toBe('AR');
		expect(initials('field team north')).toBe('FT');
		expect(initials('  Lund ')).toBe('L');
		expect(initials('')).toBe('');
		expect(initials(null)).toBe('');
	});
});
