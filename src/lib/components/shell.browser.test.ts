// The shell's layout in a real browser (Chromium): TopBar room, PageHeader folding, NavRail and
// ModePicker at narrow widths.
import '../tokens.css';
import '../base.css';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render, screen, within } from '@testing-library/svelte';
import BarHarness from '../../tests/browser/BarHarness.svelte';
import HeaderRoomHarness from '../../tests/browser/HeaderRoomHarness.svelte';

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const box = (el: Element) => el.getBoundingClientRect();
const part = (id: string, selector: string) => screen.getByTestId(id).querySelector<HTMLElement>(selector)!;

afterEach(async () => {
	await page.viewport(1280, 800);
});

describe('TopBar room in a browser', () => {
	it('shrinks start and scrolls it, keeping the actions at the end', async () => {
		render(BarHarness);
		await settle();
		for (const id of ['chips', 'scroller']) {
			const bar = box(part(id, '.ds-topbar'));
			const actions = box(part(id, '.actions'));
			const start = part(id, '.start');
			expect(Math.round(bar.right - actions.right), id).toBe(16);
			expect(box(start).right, id).toBeLessThanOrEqual(actions.left);
			expect(start.scrollWidth, id).toBeGreaterThan(start.clientWidth);
		}
	});

	it('keeps the actions at the end on a phone, where there is no spacer', async () => {
		await page.viewport(375, 800);
		render(BarHarness);
		await settle();
		const bar = box(part('short', '.ds-topbar'));
		expect(Math.round(bar.right - box(part('short', '.actions')).right)).toBe(12);
	});
});

describe('PageHeader room in a browser', () => {
	const state = (id: string) => {
		const header = within(screen.getByTestId(id));
		const title = part(id, '.title');
		const lead = box(part(id, '.lead'));
		const actions = box(part(id, '.actions'));
		return {
			inline: header.queryByRole('searchbox', { name: 'Find' }) !== null,
			toggle: header.queryByRole('button', { name: 'Search' }) !== null,
			compact: header.getByRole('button', { name: 'Export' }).textContent?.trim() === '',
			oneLine: actions.top < lead.bottom,
			titleWhole: title.scrollWidth <= title.clientWidth
		};
	};

	it('collapses the shell actions first, then makes the page actions compact', async () => {
		render(HeaderRoomHarness);
		await settle();
		await settle();
		expect(state('wide')).toEqual({ inline: true, toggle: false, compact: false, oneLine: true, titleWhole: true });
		expect(state('mid')).toEqual({ inline: false, toggle: true, compact: false, oneLine: true, titleWhole: true });
		expect(state('narrow')).toEqual({ inline: false, toggle: true, compact: true, oneLine: true, titleWhole: true });
	});

	it('gives the room back when the header widens', async () => {
		render(HeaderRoomHarness);
		await settle();
		await settle();
		screen.getByTestId('narrow').style.width = '1000px';
		for (let i = 0; i < 4; i++) await settle();
		expect(state('narrow')).toEqual(state('wide'));
	});
});

describe('ModePicker and SegmentedControl in a narrow container', () => {
	it('fits a 320px flex row or grid cell and scrolls', async () => {
		render(BarHarness);
		await settle();
		for (const id of ['mode-flex', 'mode-grid']) {
			const strip = part(id, '.ds-segmented');
			expect(box(part(id, '.ds-modepicker')).width, id).toBeLessThanOrEqual(320);
			expect(box(strip).width, id).toBeLessThanOrEqual(320);
			expect(strip.scrollWidth, id).toBeGreaterThan(strip.clientWidth);
		}
	});

	it('scrolls the selected option into view', async () => {
		render(BarHarness);
		await settle();
		const strip = part('segments', '.ds-segmented');
		const map = within(strip).getByRole('radio', { name: 'Map' });
		expect(strip.scrollLeft).toBeGreaterThan(0);
		expect(box(map).right).toBeLessThanOrEqual(box(strip).right + 1);
	});
});

describe('NavRail version in a browser', () => {
	it('shows the version collapsed, truncated to the rail, and in full on hover', async () => {
		render(BarHarness);
		await settle();
		const rail = box(part('rail', '.ds-navrail'));
		const version = part('rail', '.version');
		expect(box(version).width).toBeGreaterThan(0);
		expect(box(version).right).toBeLessThanOrEqual(rail.right);
		expect(version.scrollWidth).toBeGreaterThan(version.clientWidth);
		await userEvent.hover(version);
		await new Promise((r) => setTimeout(r, 400));
		expect(part('rail', '.tip').textContent).toBe('v12.40.3-rc.1');
	});
});
