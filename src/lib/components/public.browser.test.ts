// Runs in a real browser (Chromium): layout, overflow and the charts' top-layer tooltips.
import '../tokens.css';
import '../base.css';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render, screen } from '@testing-library/svelte';
import PublicHarness from '../../tests/browser/PublicHarness.svelte';

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const box = (el: Element) => el.getBoundingClientRect();
const part = (id: string, selector: string) => screen.getByTestId(id).querySelector(selector)!;

describe('CodeBlock in a browser', () => {
	it('scrolls a long line inside itself, with the copy button beside the text, not over it', async () => {
		render(PublicHarness);
		await settle();
		const frame = part('code', '.frame');
		const pre = part('code', 'pre') as HTMLElement;
		const copy = part('code', 'button');
		expect(box(frame).width).toBeLessThanOrEqual(300);
		expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth);
		expect(box(copy).left).toBeGreaterThanOrEqual(box(pre).right - 0.5);
		expect(box(copy).right).toBeLessThanOrEqual(box(frame).right);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
	});
});

describe('Notice in a browser', () => {
	it('puts the action beside the body when there is room, and under it when narrow', async () => {
		render(PublicHarness);
		await settle();
		const narrow = { body: box(part('notice-narrow', '.body')), action: box(part('notice-narrow', '.action')) };
		expect(narrow.action.top).toBeGreaterThanOrEqual(narrow.body.bottom);
		const wide = { body: box(part('notice-wide', '.body')), action: box(part('notice-wide', '.action')) };
		expect(wide.action.top).toBeLessThan(wide.body.bottom);
		expect(wide.action.left).toBeGreaterThan(wide.body.right - 1);
	});
});

describe('FactList inline in a browser', () => {
	it('is one row of label-over-value facts when wide, and wraps when narrow', async () => {
		render(PublicHarness);
		await settle();
		const tops = (id: string) =>
			new Set([...screen.getByTestId(id).querySelectorAll('.fact')].map((f) => Math.round(box(f).top)));
		expect(tops('facts-wide').size).toBe(1);
		expect(tops('facts-narrow').size).toBeGreaterThan(1);
		const fact = part('facts-wide', '.fact');
		expect(box(fact.querySelector('dd')!).top).toBeGreaterThanOrEqual(box(fact.querySelector('dt')!).bottom);
		const narrow = screen.getByTestId('facts-narrow');
		for (const f of narrow.querySelectorAll('.fact')) expect(box(f).right).toBeLessThanOrEqual(box(narrow).right + 0.5);
	});
});

describe('Slider in a browser', () => {
	it('puts its tick labels under the track, inside its width, the middle one centered', async () => {
		render(PublicHarness);
		await settle();
		const track = box(part('slider', '.track'));
		const ticks = [...screen.getByTestId('slider').querySelectorAll('.tick')].map(box);
		for (const t of ticks) {
			expect(t.top).toBeGreaterThanOrEqual(track.bottom);
			expect(t.left).toBeGreaterThanOrEqual(track.left - 0.5);
			expect(t.right).toBeLessThanOrEqual(track.right + 0.5);
		}
		const middle = ticks[1];
		expect(Math.abs((middle.left + middle.right) / 2 - (track.left + track.right) / 2)).toBeLessThan(1);
		const fill = box(part('slider', '.fill'));
		expect(Math.abs(fill.right - (track.left + track.right) / 2)).toBeLessThan(1);
	});

	it('moves with the keyboard and shows the value', async () => {
		render(PublicHarness);
		const slider = screen.getByRole('slider', { name: 'Detail' }) as HTMLInputElement;
		slider.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(slider.value).toBe('51');
		expect(part('slider', 'output').textContent).toBe('51');
	});
});

describe('charts in a browser', () => {
	it('shows a bar series tooltip in the top layer above the hovered bar', async () => {
		render(PublicHarness);
		await settle();
		const slots = screen.getByTestId('bars').querySelectorAll('.slot');
		await userEvent.hover(slots[3]);
		await settle();
		const tip = document.querySelector<HTMLElement>('.ds-charttip')!;
		expect(tip.matches(':popover-open')).toBe(true);
		expect(tip.textContent).toContain('Oct 4');
		expect(box(tip).bottom).toBeLessThanOrEqual(box(slots[3].querySelector('.pile')!).top);
		await userEvent.unhover(slots[3]);
		await settle();
		expect(document.querySelector('.ds-charttip')).toBeNull();
	});

	it('opens a bar series tooltip from the keyboard, on the latest period', async () => {
		render(PublicHarness);
		const plot = screen.getByRole('img', { name: 'Records per day' });
		plot.focus();
		await settle();
		const tip = document.querySelector<HTMLElement>('.ds-charttip')!;
		expect(tip.matches(':popover-open')).toBe(true);
		expect(tip.textContent).toContain('Oct 12');
	});

	it('places the ring tooltip beside the focused arc, inside the viewport', async () => {
		render(PublicHarness);
		const ring = screen.getByRole('img', { name: 'Records by state' });
		ring.focus();
		await settle();
		await settle();
		const tip = document.querySelector<HTMLElement>('.ds-charttip')!;
		expect(tip.textContent).toContain('Done');
		const t = box(tip);
		expect(t.top).toBeGreaterThanOrEqual(0);
		expect(t.left).toBeGreaterThanOrEqual(0);
		expect(t.right).toBeLessThanOrEqual(window.innerWidth);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.querySelector('.ds-charttip')!.textContent).toContain('In progress');
	});

	it('draws a cell bar in a table cell as a share of the column, on one line', async () => {
		render(PublicHarness);
		await settle();
		const bars = [...screen.getByTestId('table').querySelectorAll('.ds-cellbar')];
		const [full, quarter] = bars.map((b) => box(b.querySelector('.bar')!).width);
		const track = box(bars[0].querySelector('.track')!).width;
		expect(Math.abs(full - track)).toBeLessThan(1);
		expect(Math.abs(quarter - track * 0.25)).toBeLessThan(1);
		const cell = box(bars[0]);
		expect(cell.height).toBeLessThan(24);
	});
});
