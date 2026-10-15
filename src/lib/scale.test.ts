import { describe, expect, it } from 'vitest';
import { checkScaleContrast, contrastRatio, defineScale } from './scale.js';
import { severityScale } from './severity.js';

const stop = (value: string, label: string) => ({
	value,
	label,
	mark: `var(--app-${value})`,
	bg: `var(--app-${value}-bg)`,
	ink: `var(--app-${value}-ink)`
});

const priority = defineScale({
	name: 'Priority',
	stops: [stop('p4', 'P4'), stop('p3', 'P3'), stop('p2', 'P2'), stop('p1', 'P1')],
	unknown: { value: 'untriaged', label: 'Untriaged' }
});

describe('defineScale', () => {
	it('orders, names and ranks its stops', () => {
		expect(priority.values).toEqual(['p4', 'p3', 'p2', 'p1']);
		expect(priority.label('p2')).toBe('P2');
		expect(priority.rank('p4')).toBe(1);
		expect(priority.rank('p1')).toBe(4);
		expect(priority.vars('p3')).toEqual({
			mark: 'var(--app-p3)',
			bg: 'var(--app-p3-bg)',
			ink: 'var(--app-p3-ink)'
		});
		expect(priority.has('p1')).toBe(true);
		expect(priority.has('untriaged')).toBe(true);
		expect(priority.has('p0')).toBe(false);
	});

	it('treats null as unset: no name, no rank, no colors', () => {
		expect(priority.label(null)).toBe('');
		expect(priority.rank(undefined)).toBe(0);
		expect(priority.vars(null)).toBeNull();
		expect(priority.stop(null)).toBeNull();
	});

	it('keeps the unknown stop out of the order, with neutral colors by default', () => {
		expect(priority.isUnknown('untriaged')).toBe(true);
		expect(priority.rank('untriaged')).toBe(0);
		expect(priority.label('untriaged')).toBe('Untriaged');
		expect(priority.vars('untriaged')?.ink).toBe('var(--ds-text-2)');
		expect(priority.highest(['p3', 'untriaged', null, 'p2'])).toBe('p2');
		expect(priority.highest(['untriaged', null])).toBeNull();
		const sorted = (['p1', 'untriaged', 'p3', null] as const).toSorted(priority.compare);
		expect(sorted.slice(2)).toEqual(['p3', 'p1']);
	});

	it('hides stops above a ceiling, but never the unknown stop', () => {
		expect(priority.options('p3').map((s) => s.value)).toEqual(['p4', 'p3', 'untriaged']);
		expect(priority.options().map((s) => s.value)).toHaveLength(5);
	});

	it('maps key caps 1–N by rank and 0 to unknown, respecting a ceiling', () => {
		expect(priority.key('p4')).toBe('1');
		expect(priority.key('untriaged')).toBe('0');
		expect(priority.fromKey('2')).toBe('p3');
		expect(priority.fromKey('0')).toBe('untriaged');
		expect(priority.fromKey('4', 'p2')).toBeNull();
		expect(priority.fromKey('x')).toBeNull();
	});

	it('refuses too few, too many or repeated stops', () => {
		expect(() => defineScale({ name: 'One', stops: [stop('a', 'A')] })).toThrow();
		const ten = Array.from({ length: 10 }, (_, i) => stop(`s${i}`, `Stop ${i}`));
		expect(() => defineScale({ name: 'Ten', stops: ten })).toThrow();
		expect(() =>
			defineScale({
				name: 'Twice',
				stops: [stop('a', 'A'), stop('b', 'B')],
				unknown: { value: 'a', label: 'A' }
			})
		).toThrow();
	});
});

describe('severityScale', () => {
	it('is the built-in instance, on the severity tokens', () => {
		expect(severityScale.name).toBe('Severity');
		expect(severityScale.values).toEqual(['info', 'low', 'medium', 'high', 'critical']);
		expect(severityScale.unknown).toBeNull();
		expect(severityScale.vars('critical')?.mark).toBe('var(--ds-sev-critical)');
		expect(severityScale.off).toBe('var(--ds-sev-off)');
	});
});

describe('checkScaleContrast', () => {
	it('computes WCAG ratios', () => {
		expect(contrastRatio('#000', '#ffffff')).toBeCloseTo(21, 5);
		expect(contrastRatio('rgb(255, 255, 255)', '#fff')).toBe(1);
	});

	it('checks each stop’s ink on its ground and its mark on the page grounds', () => {
		const colors: Record<string, string> = {
			'var(--ds-bg-1)': '#14151f',
			'var(--ds-bg-3)': '#1d1f2c',
			'var(--ds-text-2)': '#b8bbcc',
			'var(--ds-text-3)': '#8c90a5'
		};
		const resolve = (css: string) =>
			colors[css] ??
			(css.endsWith('-ink)') ? '#e0e0e0' : css.endsWith('-bg)') ? '#202020' : '#303030');
		const results = checkScaleContrast(priority, { resolve });
		// Five stops: one ink pair and two mark pairs each.
		expect(results).toHaveLength(15);
		const failing = results.filter((r) => !r.ok);
		expect(failing.every((r) => r.pair === 'mark on ground' && r.value !== 'untriaged')).toBe(true);
		expect(failing).toHaveLength(8);
	});
});
