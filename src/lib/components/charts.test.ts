import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import BarSeries from './BarSeries.svelte';
import CellBar from './CellBar.svelte';
import Ring from './Ring.svelte';
import { chartColor } from '../chart.js';

describe('chartColor', () => {
	it('takes the categorical palette by position, then the second accent', () => {
		expect([0, 1, 4, 5, 6].map((i) => chartColor(undefined, i))).toEqual([
			'var(--ds-cat-1)',
			'var(--ds-cat-2)',
			'var(--ds-cat-5)',
			'var(--ds-accent-2)',
			'var(--ds-cat-1)'
		]);
		expect(chartColor('accent-2', 0)).toBe('var(--ds-accent-2)');
		expect(chartColor(3, 0)).toBe('var(--ds-cat-3)');
	});
});

describe('CellBar', () => {
	it('shows the value as text and draws a bar as a share of max', () => {
		const { container } = render(CellBar, { value: 310, max: 1240 });
		expect(container.querySelector('.value')?.textContent).toBe('310');
		const bar = container.querySelector('.bar') as HTMLElement;
		expect(bar.style.width).toBe('25%');
		expect(bar.style.background).toBe('var(--ds-cat-1)');
		expect(container.querySelector('.track')?.getAttribute('aria-hidden')).toBe('true');
	});

	it('clamps to the track, and keeps the value for a screen reader when hidden', () => {
		const { container } = render(CellBar, { value: 2000, max: 1000, showValue: false, tone: 'accent-2' });
		expect((container.querySelector('.bar') as HTMLElement).style.width).toBe('100%');
		const value = container.querySelector('.ds-sr-only') as HTMLElement;
		expect(value.textContent).toBe('2,000');
	});

	it('draws nothing for zero', () => {
		const { container } = render(CellBar, { value: 0, max: 10 });
		expect(container.querySelector('.bar')).toBeNull();
	});
});

describe('BarSeries', () => {
	const series = [
		{ key: 'a', label: 'Opened' },
		{ key: 'b', label: 'Closed' }
	];
	const data = ['Oct 1', 'Oct 2', 'Oct 3', 'Oct 4', 'Oct 5'].map((label, i) => ({
		label,
		title: `${label}, 2026`,
		values: { a: i + 1, b: 2 }
	}));

	it('is an image named by its label, with the values in a data table', () => {
		render(BarSeries, { series, data, label: 'Records per day' });
		expect(screen.getByRole('img', { name: 'Records per day' })).toBeTruthy();
		const table = screen.getByRole('table', { name: 'Records per day' });
		const headers = within(table)
			.getAllByRole('columnheader')
			.map((h) => h.textContent);
		expect(headers).toEqual(['Opened', 'Closed', 'Total']);
		const rows = within(table).getAllByRole('row').slice(1);
		expect(rows).toHaveLength(5);
		expect(rows[4].textContent).toBe('Oct 5, 2026527');
	});

	it('stacks each series, scaled to the largest total', () => {
		const { container } = render(BarSeries, { series, data, label: 'Records', height: 140 });
		const stacks = container.querySelectorAll('.pile');
		expect(stacks).toHaveLength(5);
		const last = [...stacks[4].querySelectorAll<HTMLElement>('.seg')].map((s) => s.style.height);
		expect(last).toEqual(['100px', '40px']);
		expect(container.querySelector('.scale')?.textContent).toBe('7');
	});

	it('names the first, middle and last periods under the bars', () => {
		const { container } = render(BarSeries, { series, data, label: 'Records' });
		const ticks = [...container.querySelectorAll('.x .tick')].map((t) => t.textContent);
		expect(ticks).toEqual(['Oct 1', '', 'Oct 3', '', 'Oct 5']);
	});

	it('moves through the periods with the arrows, from the latest', async () => {
		const { container } = render(BarSeries, { series, data, label: 'Records' });
		const plot = screen.getByRole('img');
		await fireEvent.focus(plot);
		const active = () =>
			[...container.querySelectorAll('.slot')].findIndex((s) => s.hasAttribute('data-active'));
		expect(active()).toBe(4);
		await fireEvent.keyDown(plot, { key: 'ArrowLeft' });
		expect(active()).toBe(3);
		await fireEvent.keyDown(plot, { key: 'Home' });
		expect(active()).toBe(0);
		await fireEvent.keyDown(plot, { key: 'ArrowLeft' });
		expect(active()).toBe(0);
		const tip = container.querySelector('.ds-charttip') as HTMLElement;
		expect(tip.getAttribute('aria-hidden')).toBe('true');
		expect(tip.textContent).toContain('Oct 1, 2026');
		expect(tip.textContent).toContain('Total');
		await fireEvent.keyDown(plot, { key: 'Escape' });
		expect(container.querySelector('.ds-charttip')).toBeNull();
	});

	it('hides the legend and the total for a single series', () => {
		const { container } = render(BarSeries, {
			series: [series[0]],
			data,
			label: 'Opened'
		});
		expect(container.querySelector('.legend')).toBeNull();
		expect(screen.queryByText('Total')).toBeNull();
	});
});

describe('Ring', () => {
	const segments = [
		{ label: 'Done', value: 60 },
		{ label: 'In progress', value: 30 },
		{ label: 'Blocked', value: 10 }
	];

	it('is an image with a legend, the total in the middle, and a data table', () => {
		const { container } = render(Ring, { segments, label: 'Records by state' });
		expect(screen.getByRole('img', { name: 'Records by state' })).toBeTruthy();
		expect(container.querySelector('.center .value')?.textContent).toBe('100');
		const rows = within(screen.getByRole('table', { name: 'Records by state' })).getAllByRole('row');
		expect(rows.map((r) => r.textContent)).toEqual(['Done6060%', 'In progress3030%', 'Blocked1010%']);
		expect(container.querySelectorAll('.arc')).toHaveLength(3);
	});

	it('leaves the rest of max as track, with a total row in the table', () => {
		const { container } = render(Ring, {
			segments: [{ label: 'Used', value: 71 }],
			max: 100,
			label: 'Storage',
			centerValue: '71%',
			centerLabel: 'used'
		});
		expect(container.querySelector('.center')?.textContent).toContain('71%');
		expect(container.querySelector('.center')?.textContent).toContain('used');
		const rows = within(screen.getByRole('table')).getAllByRole('row');
		expect(rows.at(-1)?.textContent).toBe('Total7171%');
	});

	it('steps through the arcs with the arrows, skipping empty ones', async () => {
		const { container } = render(Ring, {
			segments: [...segments.slice(0, 2), { label: 'None', value: 0 }, segments[2]],
			label: 'States'
		});
		const plot = screen.getByRole('img');
		await fireEvent.focus(plot);
		const tip = () => container.querySelector('.ds-charttip')?.textContent ?? '';
		expect(tip()).toContain('Done');
		await fireEvent.keyDown(plot, { key: 'ArrowRight' });
		await fireEvent.keyDown(plot, { key: 'ArrowRight' });
		expect(tip()).toContain('Blocked');
		await fireEvent.keyDown(plot, { key: 'ArrowRight' });
		expect(tip()).toContain('Done');
		await fireEvent.keyDown(plot, { key: 'ArrowLeft' });
		expect(tip()).toContain('Blocked');
		expect(tip()).toContain('10%');
	});
});
