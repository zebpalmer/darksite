// Runs in a real browser (vitest browser mode, Chromium): top layer, modality, focus and layout
// that jsdom cannot model.
import '../tokens.css';
import '../base.css';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render, screen } from '@testing-library/svelte';
import OverlayHarness from '../../tests/browser/OverlayHarness.svelte';
import TableHarness from '../../tests/browser/TableHarness.svelte';
import LayoutHarness from '../../tests/browser/LayoutHarness.svelte';
import JustifiedHarness from '../../tests/browser/JustifiedHarness.svelte';
import TooltipHarness from '../../tests/browser/TooltipHarness.svelte';

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

describe('Dialog in a browser', () => {
	it('is modal, starts on Cancel, keeps Tab out of the page, and returns focus on Esc', async () => {
		render(OverlayHarness);
		const trigger = screen.getByRole('button', { name: 'Delete' });
		await userEvent.click(trigger);
		const dialog = await screen.findByRole('alertdialog');
		expect(dialog.matches(':modal')).toBe(true);
		await settle();
		expect(document.activeElement?.textContent?.trim()).toBe('Cancel');
		// The page behind is inert: Tab moves within the dialog, or out to the browser itself.
		const inPage = () =>
			document.activeElement !== document.body && !dialog.contains(document.activeElement);
		for (let i = 0; i < 4; i++) {
			await userEvent.keyboard('{Tab}');
			expect(inPage()).toBe(false);
		}
		await userEvent.keyboard('{Escape}');
		await settle();
		expect(screen.queryByRole('alertdialog')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});
});

describe('Sheet in a browser', () => {
	it('is modal and returns focus on Esc', async () => {
		render(OverlayHarness);
		const trigger = screen.getByRole('button', { name: 'Edit' });
		await userEvent.click(trigger);
		const sheet = await screen.findByRole('dialog', { name: 'Edit record' });
		expect(sheet.matches(':modal')).toBe(true);
		await userEvent.keyboard('{Escape}');
		await settle();
		expect(document.activeElement).toBe(trigger);
	});
});

describe('Menu in a browser', () => {
	it('opens in the top layer beside its trigger and moves with the arrows', async () => {
		render(OverlayHarness);
		const trigger = screen.getByRole('button', { name: 'Actions' });
		trigger.focus();
		await userEvent.keyboard('{Enter}');
		const menu = await screen.findByRole('menu');
		await settle();
		expect(menu.matches(':popover-open')).toBe(true);
		const t = trigger.getBoundingClientRect();
		const m = menu.getBoundingClientRect();
		expect(m.top).toBeGreaterThanOrEqual(t.bottom - 1);
		expect(document.activeElement?.textContent).toContain('Archive');
		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement?.textContent).toContain('Duplicate');
		await userEvent.keyboard('{Escape}');
		expect(document.activeElement).toBe(trigger);
	});
});

describe('Popover in a browser', () => {
	it('is non-modal, anchored to its trigger, and closes on Esc', async () => {
		render(OverlayHarness);
		const trigger = screen.getByRole('button', { name: 'Shortcuts' });
		await userEvent.click(trigger);
		const panel = await screen.findByRole('dialog', { name: 'Shortcuts' });
		await settle();
		expect(panel.matches(':modal')).toBe(false);
		expect(panel.getBoundingClientRect().top).toBeGreaterThanOrEqual(trigger.getBoundingClientRect().bottom);
		await userEvent.keyboard('{Escape}');
		await settle();
		expect(screen.queryByRole('dialog', { name: 'Shortcuts' })).toBeNull();
	});
});

describe('Combobox in a browser', () => {
	it('shows its list in the top layer under the field, as wide as the field', async () => {
		render(OverlayHarness);
		const input = screen.getByRole('combobox', { name: 'Site' });
		await userEvent.click(input);
		await userEvent.keyboard('wing');
		const list = await screen.findByRole('listbox');
		await settle();
		const field = input.getBoundingClientRect();
		const box = list.getBoundingClientRect();
		expect(box.top).toBeGreaterThanOrEqual(field.bottom);
		expect(Math.round(box.width)).toBeGreaterThanOrEqual(Math.round(field.width) - 1);
		expect(screen.getAllByRole('option')).toHaveLength(2);
	});
});

describe('HelpTip in a browser', () => {
	it('shows its note on keyboard focus and keeps it inside the viewport', async () => {
		render(OverlayHarness);
		const edge = screen.getByRole('button', { name: 'Edge note' });
		edge.focus();
		await settle();
		await new Promise((r) => setTimeout(r, 50));
		const tip = document.getElementById(edge.getAttribute('aria-describedby')!)!;
		expect(getComputedStyle(tip).visibility).toBe('visible');
		const r = tip.getBoundingClientRect();
		expect(r.right).toBeLessThanOrEqual(window.innerWidth);
		expect(r.left).toBeGreaterThanOrEqual(0);
	});
});

describe('Table column priorities in a browser', () => {
	it('hides lower-priority columns by the table width, not the viewport', async () => {
		render(TableHarness);
		await settle();
		const narrow = screen.getByRole('table', { name: 'Narrow' });
		const wide = screen.getByRole('table', { name: 'Wide' });
		const owner = (t: HTMLElement) =>
			[...t.querySelectorAll('th')].find((th) => th.textContent?.includes('Owner'))!;
		expect(getComputedStyle(owner(narrow)).display).toBe('none');
		expect(getComputedStyle(owner(wide)).display).not.toBe('none');
	});

	it('gives the width of hidden columns to the visible ones, with groups or an empty state', async () => {
		render(TableHarness);
		await settle();
		for (const name of ['Grouped', 'Empty']) {
			const table = screen.getByRole('table', { name });
			const edge = table.getBoundingClientRect().right;
			for (const row of table.querySelectorAll('tr')) {
				const cells = [...row.children].filter((c) => getComputedStyle(c).display !== 'none');
				expect(Math.round(cells.at(-1)!.getBoundingClientRect().right)).toBe(Math.round(edge));
			}
		}
	});
});

describe('JustifiedGrid in a browser', () => {
	it('fills each full row to the container width without cropping', async () => {
		render(JustifiedHarness);
		await settle();
		const grid = screen.getByRole('list', { name: 'Photos' });
		const width = grid.getBoundingClientRect().width;
		const rows = [...grid.querySelectorAll<HTMLElement>('.row')];
		expect(rows.length).toBeGreaterThan(1);
		for (const row of rows.slice(0, -1)) {
			const tiles = [...row.children] as HTMLElement[];
			const used = tiles.reduce((w, t) => w + t.getBoundingClientRect().width, 0) + 6 * (tiles.length - 1);
			expect(Math.abs(used - width)).toBeLessThan(2);
		}
	});
});

describe('tooltip in a browser', () => {
	it('shows on keyboard focus, describes the element, and hides on Esc', async () => {
		render(TooltipHarness);
		const button = screen.getByRole('button', { name: 'Export' });
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(button);
		await settle();
		const tip = document.getElementById(button.getAttribute('aria-describedby')!)!;
		expect(tip.textContent).toBe('Exports the filtered rows');
		expect(tip.hidden).toBe(false);
		expect(tip.matches(':popover-open')).toBe(true);
		await userEvent.keyboard('{Escape}');
		expect(tip.hidden).toBe(true);
	});
});

describe('PageHeader on a narrow header', () => {
	it('wraps the actions under a title that does not fit beside them, and only then', async () => {
		render(LayoutHarness);
		await settle();
		const parts = (id: string) => {
			const header = screen.getByTestId(id).querySelector('.ds-pageheader')!;
			return {
				title: header.querySelector('.title')!,
				lead: header.querySelector('.lead')!.getBoundingClientRect(),
				actions: header.querySelector('.actions')!.getBoundingClientRect()
			};
		};
		const long = parts('long');
		expect(long.actions.top).toBeGreaterThanOrEqual(long.lead.bottom);
		expect(long.title.scrollWidth).toBeLessThanOrEqual(long.title.clientWidth);
		const short = parts('short');
		expect(short.actions.top).toBeLessThan(short.lead.bottom);
	});
});

describe('StatRow in a browser', () => {
	it('puts five stats on one line with max={5}, and never leaves the fifth alone', async () => {
		render(LayoutHarness);
		await settle();
		const tops = (id: string) =>
			[...screen.getByTestId(id).querySelectorAll('.ds-stat')].map((s) => Math.round(s.getBoundingClientRect().top));
		expect(new Set(tops('five')).size).toBe(1);
		const narrow = tops('five-narrow');
		expect(narrow.filter((t) => t === narrow[0])).toHaveLength(3);
	});
});
