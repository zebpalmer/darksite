// The shell's layout in a real browser (Chromium): TopBar room, PageHeader folding, NavRail and
// ModePicker at narrow widths.
import '../tokens.css';
import '../base.css';
import { afterEach, describe, expect, it } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render, screen, within } from '@testing-library/svelte';
import BarHarness from '../../tests/browser/BarHarness.svelte';
import HeaderRoomHarness from '../../tests/browser/HeaderRoomHarness.svelte';
import HeaderChipsHarness from '../../tests/browser/HeaderChipsHarness.svelte';
import HeaderPhoneHarness from '../../tests/browser/HeaderPhoneHarness.svelte';

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

describe('PageHeader on a phone, in a browser', () => {
	// Touch emulation makes Chromium match (pointer: coarse): every button is 44px.
	const touch = (enabled: boolean) =>
		cdp().send('Emulation.setTouchEmulationEnabled', enabled ? { enabled, maxTouchPoints: 5 } : { enabled });
	afterEach(async () => {
		await touch(false);
	});

	const check = (id: string, label: string) => {
		const frame = screen.getByTestId(id);
		const header = part(id, '.ds-pageheader');
		const title = part(id, '.title');
		const right = box(header).right;
		// Nothing runs past the header, the frame or the page.
		expect(header.scrollWidth, label).toBeLessThanOrEqual(header.clientWidth);
		expect(right, label).toBeLessThanOrEqual(box(frame).right + 0.5);
		for (const button of header.querySelectorAll('button')) {
			expect(box(button).right, `${label}: ${button.getAttribute('aria-label') ?? button.textContent}`).toBeLessThanOrEqual(
				right + 0.5
			);
		}
		expect(document.documentElement.scrollWidth, label).toBeLessThanOrEqual(window.innerWidth);
		// The title keeps its one line.
		expect(box(title).height, label).toBe(parseFloat(getComputedStyle(title).lineHeight));
		const actions = within(header);
		return {
			toggle: actions.queryByRole('button', { name: 'Search' }) !== null,
			compact: actions.getByRole('button', { name: 'Export' }).textContent?.trim() === ''
		};
	};

	for (const width of [320, 375, 390]) {
		for (const coarse of [true, false]) {
			it(`folds a title and several actions to compact at ${width}px${coarse ? ', 44px targets' : ''}`, async () => {
				await touch(coarse);
				await page.viewport(width, 800);
				render(HeaderPhoneHarness);
				await settle();
				await settle();
				expect(matchMedia('(pointer: coarse)').matches).toBe(coarse);
				for (const id of ['several', 'many']) {
					expect(check(id, `${id} at ${width}px`), id).toEqual({ toggle: true, compact: true });
				}
			});
		}
	}

	it('keeps the full form where it fits, and folds when the header narrows', async () => {
		await touch(true);
		await page.viewport(1280, 800);
		render(HeaderPhoneHarness, { phone: false, width: '1000px' });
		await settle();
		await settle();
		expect(check('several', 'wide')).toEqual({ toggle: false, compact: false });
		screen.getByTestId('several').style.width = '320px';
		for (let i = 0; i < 4; i++) await settle();
		expect(check('several', 'narrowed')).toEqual({ toggle: true, compact: true });
		screen.getByTestId('several').style.width = '1000px';
		for (let i = 0; i < 4; i++) await settle();
		expect(check('several', 'widened')).toEqual({ toggle: false, compact: false });
	});
});

describe('PageHeader chips in a browser', () => {
	const parts = (id: string) => {
		const frame = screen.getByTestId(id);
		const header = frame.querySelector<HTMLElement>('.ds-pageheader')!;
		return {
			frame,
			header,
			title: header.querySelector<HTMLElement>('.title')!,
			chips: [...header.querySelectorAll<HTMLElement>('.ds-chip')]
		};
	};

	it('wraps the chips under the title at 375px, without widening the header', async () => {
		render(HeaderChipsHarness);
		await settle();
		await settle();
		for (const id of ['phone', 'phone-bare', 'phone-long']) {
			const { frame, header, title, chips } = parts(id);
			expect(header.scrollWidth, id).toBeLessThanOrEqual(header.clientWidth);
			expect(box(header).right, id).toBeLessThanOrEqual(box(frame).right + 0.5);
			expect(chips, id).toHaveLength(2);
			for (const chip of chips) {
				expect(box(chip).top, id).toBeGreaterThanOrEqual(box(title).bottom);
				expect(box(chip).right, id).toBeLessThanOrEqual(box(header).right);
			}
			// The title stays one line: as tall as its line height.
			expect(box(title).height, id).toBe(parseFloat(getComputedStyle(title).lineHeight));
		}
		// A title longer than the header still truncates on its one line.
		const long = parts('phone-long').title;
		expect(long.scrollWidth).toBeGreaterThan(long.clientWidth);
		// The actions keep folding: compact, then on their own line under the lead.
		const phone = within(screen.getByTestId('phone'));
		expect(phone.getByRole('button', { name: 'New record' }).textContent?.trim()).toBe('');
		const lead = box(part('phone', '.lead'));
		expect(box(part('phone', '.actions')).top).toBeGreaterThanOrEqual(lead.bottom);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
	});

	it('keeps the chips beside the title, on the one 56px line, when there is room', async () => {
		render(HeaderChipsHarness);
		await settle();
		await settle();
		const { header, title, chips } = parts('wide');
		for (const chip of chips) expect(box(chip).top).toBeLessThan(box(title).bottom);
		expect(Math.round(box(header).height)).toBe(56);
		expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth);
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
