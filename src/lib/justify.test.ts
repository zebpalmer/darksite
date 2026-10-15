import { describe, expect, it } from 'vitest';
import { clampAspect, justifyRows } from './justify.js';
import { formatDuration } from './time.js';

const rowWidth = (row: { boxes: { width: number }[] }, gap: number) =>
	row.boxes.reduce((w, b) => w + b.width, 0) + gap * (row.boxes.length - 1);

describe('justifyRows', () => {
	it('fills every row but the last exactly, near the target, keeping order', () => {
		const aspects = [1.5, 0.67, 1, 1.78, 1.33, 0.75, 1.5, 2, 1, 1.5, 0.8];
		const rows = justifyRows(aspects, { width: 1000, target: 220, gap: 6 });
		const flat = rows.flatMap((r) => r.boxes.map((b) => b.index));
		expect(flat).toEqual(aspects.map((_, i) => i));
		for (const row of rows.slice(0, -1)) {
			expect(rowWidth(row, 6)).toBeCloseTo(1000, 6);
			expect(row.height).toBeGreaterThan(220 * 0.5);
			expect(row.height).toBeLessThanOrEqual(220 * 1.6);
		}
	});

	it('keeps the aspect ratio of every image', () => {
		const rows = justifyRows([1.5, 0.5, 2], { width: 600, target: 200 });
		for (const b of rows.flatMap((r) => r.boxes)) {
			expect(b.width / b.height).toBeCloseTo(clampAspect([1.5, 0.5, 2][b.index]), 6);
		}
	});

	it('does not stretch a short last row', () => {
		const rows = justifyRows([1, 1, 1, 1, 1, 1, 1], { width: 1000, target: 200, gap: 0 });
		const last = rows.at(-1)!;
		expect(last.height).toBe(200);
		expect(rowWidth(last, 0)).toBeLessThan(1000);
	});

	it('shrinks a last row that would overfill', () => {
		const rows = justifyRows([5], { width: 400, target: 200, gap: 0 });
		expect(rows[0].height).toBeCloseTo(80);
	});

	it('clamps unknown and extreme ratios', () => {
		expect(clampAspect(NaN)).toBe(1);
		expect(clampAspect(0)).toBe(1);
		expect(clampAspect(40)).toBe(5);
		expect(clampAspect(0.01)).toBe(0.2);
	});

	it('returns nothing without a width', () => {
		expect(justifyRows([1, 2], { width: 0, target: 200 })).toEqual([]);
	});
});

describe('formatDuration', () => {
	it('formats seconds as a clock', () => {
		expect(formatDuration(42)).toBe('0:42');
		expect(formatDuration(605)).toBe('10:05');
		expect(formatDuration(3725)).toBe('1:02:05');
		expect(formatDuration(null)).toBe('');
	});
});
