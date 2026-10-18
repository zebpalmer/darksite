// Runs in a real browser (vitest browser mode, Chromium): top layer, modality, focus and layout
// that jsdom cannot model.
import '../tokens.css';
import '../base.css';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render, screen } from '@testing-library/svelte';
import OverlayHarness from '../../tests/browser/OverlayHarness.svelte';
import TableHarness from '../../tests/browser/TableHarness.svelte';
import StripeHarness from '../../tests/browser/StripeHarness.svelte';
import LayoutHarness from '../../tests/browser/LayoutHarness.svelte';
import JustifiedHarness from '../../tests/browser/JustifiedHarness.svelte';
import TooltipHarness from '../../tests/browser/TooltipHarness.svelte';
import BrandHarness from '../../tests/browser/BrandHarness.svelte';
import TopNavHarness from '../../tests/browser/TopNavHarness.svelte';
import WidthHarness from '../../tests/browser/WidthHarness.svelte';
import HeadHarness from '../../tests/browser/HeadHarness.svelte';
import ProseHarness from '../../tests/browser/ProseHarness.svelte';
import SiteHarness from '../../tests/browser/SiteHarness.svelte';
import StatLevelsHarness from '../../tests/browser/StatLevelsHarness.svelte';
import '../brands/teal.css';

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

describe('Dialog hero in a browser', () => {
	// The dialog element, not the panel: the panel carries the motion, so its box is mid-animation.
	const panel = (dialog: HTMLElement) => dialog.getBoundingClientRect();

	it('is modal, centered at 520px on a desktop, and returns focus on Esc', async () => {
		render(OverlayHarness);
		const trigger = screen.getByRole('button', { name: 'Sign up' });
		await userEvent.click(trigger);
		const dialog = await screen.findByRole('dialog', { name: 'Welcome' });
		expect(dialog.matches(':modal')).toBe(true);
		await settle();
		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Email' }));
		const box = panel(dialog);
		expect(Math.round(box.width)).toBe(520);
		expect(Math.abs(box.left - (window.innerWidth - box.right))).toBeLessThanOrEqual(1);
		expect(Math.abs(box.top - (window.innerHeight - box.bottom))).toBeLessThanOrEqual(1);
		const title = dialog.querySelector('.title')!;
		expect(getComputedStyle(title).textAlign).toBe('center');
		expect(getComputedStyle(title).fontSize).toBe('24px');
		await userEvent.keyboard('{Escape}');
		await settle();
		expect(screen.queryByRole('dialog', { name: 'Welcome' })).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('stacks its actions full width on a desktop, the primary over a quiet Cancel', async () => {
		render(OverlayHarness);
		await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));
		const dialog = await screen.findByRole('dialog', { name: 'Welcome' });
		await settle();
		// Layout boxes, not client rects: the panel's entry motion scales it.
		const actions = dialog.querySelector<HTMLElement>('.actions')!;
		const confirm = screen.getByRole('button', { name: 'Get started' });
		const cancel = screen.getByRole('button', { name: 'Not now' });
		expect(actions.clientWidth).toBeGreaterThan(400);
		expect(confirm.offsetWidth).toBe(actions.clientWidth);
		expect(cancel.offsetWidth).toBe(actions.clientWidth);
		expect(confirm.offsetLeft).toBe(cancel.offsetLeft);
		expect(confirm.offsetTop + confirm.offsetHeight).toBeLessThanOrEqual(cancel.offsetTop);
		expect(confirm.offsetHeight).toBe(36);
		// Cancel is text-style: no fill, no border, the secondary text color.
		const quiet = getComputedStyle(cancel);
		expect(quiet.backgroundColor).toBe('rgba(0, 0, 0, 0)');
		expect(quiet.borderTopColor).toBe('rgba(0, 0, 0, 0)');
		expect(quiet.color).toBe(getComputedStyle(dialog.querySelector('.desc')!).color);
		await userEvent.keyboard('{Escape}');
		await settle();
		expect(screen.queryByRole('dialog', { name: 'Welcome' })).toBeNull();
	});

	it('is a full-width bottom sheet with a grab handle on a phone', async () => {
		await page.viewport(375, 700);
		try {
			render(OverlayHarness);
			await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));
			const dialog = await screen.findByRole('dialog', { name: 'Welcome' });
			await settle();
			const box = panel(dialog);
			expect(Math.round(box.left)).toBe(0);
			expect(Math.round(box.width)).toBe(375);
			expect(Math.round(box.bottom)).toBe(700);
			const grab = dialog.querySelector('.grab')!;
			expect(getComputedStyle(grab).display).toBe('block');
		} finally {
			await page.viewport(1280, 800);
		}
	});
});

describe('Stat levels in a browser', () => {
	it('wraps whole entries in a narrow tile, and no line starts with a dot', async () => {
		render(StatLevelsHarness);
		await settle();
		const levels = document.querySelector<HTMLElement>('.ds-stat .levels')!;
		const box = levels.getBoundingClientRect();
		const entries = [...levels.querySelectorAll<HTMLElement>('.entry')];
		expect(entries).toHaveLength(4);
		const lines = new Map<number, HTMLElement[]>();
		for (const e of entries) {
			const top = Math.round(e.getBoundingClientRect().top);
			lines.set(top, [...(lines.get(top) ?? []), e]);
		}
		expect(lines.size).toBeGreaterThan(1);
		for (const line of lines.values()) {
			// The first entry's dot sits in the clipped 15px gutter, left of the visible box.
			const first = line[0].getBoundingClientRect();
			expect(Math.round(first.left)).toBe(Math.round(box.left - 15));
			for (const e of line) {
				const r = e.getBoundingClientRect();
				// Whole: the badge and its count fit inside the tile.
				expect(r.right).toBeLessThanOrEqual(box.right + 0.5);
				expect(e.querySelector('.count')!.getBoundingClientRect().right).toBeLessThanOrEqual(
					box.right + 0.5
				);
			}
		}
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

	it('stays through the scroll that brings a focused element into view, and hides once it leaves', async () => {
		render(TooltipHarness);
		const button = screen.getByRole('button', { name: 'Archive' });
		screen.getByRole('button', { name: 'Export' }).focus();
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(button);
		// The focus scrolled the page; its scroll event arrives after the tooltip shows.
		await settle();
		await settle();
		const tip = document.getElementById(button.getAttribute('aria-describedby')!)!;
		expect(window.scrollY).toBeGreaterThan(0);
		expect(tip.matches(':popover-open')).toBe(true);
		window.scrollTo(0, 0);
		await settle();
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

describe('brands in a browser', () => {
	it('re-colors the root and a reading mode set below it', async () => {
		render(BrandHarness);
		await settle();
		const root = document.documentElement;
		root.dataset.brand = 'teal';
		root.setAttribute('data-ds-theme', 'dark');
		const reader = document.querySelector<HTMLElement>('[data-ds-theme="paper"]')!;
		const accent = (el: Element) => getComputedStyle(el).getPropertyValue('--ds-accent').trim();
		expect(accent(root)).toBe('#2bb3a8');
		const paper = accent(reader);
		expect(paper).not.toBe('#2bb3a8');
		expect(paper).not.toBe(getComputedStyle(document.body).getPropertyValue('--color-primary-700').trim());
		delete root.dataset.brand;
		expect(accent(root)).not.toBe('#2bb3a8');
		root.removeAttribute('data-ds-theme');
	});
});

describe('top navigation in a browser', () => {
	it('opens a group menu in the top layer under its button, focus inside', async () => {
		render(TopNavHarness);
		const button = screen.getByRole('button', { name: 'Records' });
		await userEvent.click(button);
		await settle();
		const panel = document.querySelector<HTMLElement>('.panel')!;
		expect(panel.matches(':popover-open')).toBe(true);
		expect(panel.getBoundingClientRect().top).toBeGreaterThanOrEqual(button.getBoundingClientRect().bottom);
		expect(panel.contains(document.activeElement)).toBe(true);
		await userEvent.keyboard('{Escape}');
		expect(document.activeElement).toBe(button);
	});

	it('lays a sectioned menu out in columns side by side, the footer row under them', async () => {
		render(TopNavHarness, { sectioned: true });
		await userEvent.click(screen.getByRole('button', { name: 'Guides' }));
		await settle();
		const panel = document.querySelector<HTMLElement>('.panel')!;
		expect(Math.round(panel.getBoundingClientRect().width)).toBe(3 * 240 + 8);
		const cols = [...panel.querySelectorAll('.col')].map((c) => c.getBoundingClientRect());
		expect(cols).toHaveLength(3);
		expect(cols[0].top).toBe(cols[2].top);
		expect(cols[1].left).toBeGreaterThan(cols[0].right - 1);
		const foot = panel.querySelector('.foot')!.getBoundingClientRect();
		expect(foot.top).toBeGreaterThanOrEqual(Math.max(...cols.map((c) => c.bottom)));
		expect(panel.contains(document.activeElement)).toBe(true);
	});
});

describe('Table column widths in a browser', () => {
	it('resolves a percentage inside clamp(), min() and calc() against the table', async () => {
		const cases: [string, number, number][] = [
			['clamp(120px, 30%, 240px)', 375, 120],
			['clamp(120px, 30%, 240px)', 900, 240],
			['min(30%, 200px)', 900, 200],
			['calc(20% + 40px)', 500, 140],
			['30%', 500, 150]
		];
		for (const [width, tableWidth, expected] of cases) {
			const { unmount } = render(WidthHarness, { width, tableWidth });
			await settle();
			await settle();
			const th = document.querySelector('th')!;
			expect(Math.round(th.getBoundingClientRect().width), `${width} at ${tableWidth}px`).toBe(expected);
			unmount();
		}
	});
});

describe('Table headers in a browser', () => {
	const labels = () =>
		[...document.querySelectorAll('th')].map((th) => {
			const label = th.querySelector<HTMLElement>('.sort span, .label')!;
			return { text: label.textContent, cut: label.scrollWidth > label.clientWidth };
		});

	it('truncates a sortable header only when its column is narrower than the label', async () => {
		const wide = render(HeadHarness);
		await settle();
		expect(labels().filter((l) => l.cut)).toEqual([]);
		wide.unmount();

		render(HeadHarness, { widths: { score: '96px', state: '120px' } });
		await settle();
		expect(labels()).toEqual([
			{ text: 'Name', cut: false },
			{ text: 'Reliability', cut: true },
			{ text: 'Status', cut: false }
		]);
	});
});

describe('document prose in a browser', () => {
	const place = () => {
		const main = document.querySelector('#ds-main')!.getBoundingClientRect();
		const prose = document.querySelector('.ds-prose')!.getBoundingClientRect();
		return { left: prose.left - main.left, right: main.right - prose.right };
	};

	it('centers the article under a top bar and starts it beside a rail', async () => {
		const top = render(ProseHarness, { nav: 'top' });
		await settle();
		const centered = place();
		expect(centered.left).toBeGreaterThan(100);
		expect(Math.abs(centered.left - centered.right)).toBeLessThanOrEqual(1);
		top.unmount();

		const rail = render(ProseHarness, { nav: 'rail' });
		await settle();
		expect(place().left).toBeLessThan(40);
		rail.unmount();

		render(ProseHarness, { nav: 'top', proseAlign: 'start' });
		await settle();
		expect(place().left).toBeLessThan(40);
	});
});

describe('a capped site in a browser', () => {
	const left = (el: Element) => Math.round(el.getBoundingClientRect().left);

	it('caps the content at contentWidth and keeps the bar and footer to the same edges', async () => {
		const capped = render(SiteHarness, { contentWidth: true });
		await settle();
		const content = document.querySelector('[data-testid="content"]')!;
		const edge = (window.innerWidth - 1060) / 2;
		expect(left(content)).toBe(edge);
		expect(Math.round(content.getBoundingClientRect().width)).toBe(1060);
		expect(left(document.querySelector('.ds-topnav .brand')!)).toBe(edge);
		expect(left(document.querySelector('[data-testid="foot"]')!)).toBe(edge - 24);
		capped.unmount();

		const wide = render(SiteHarness, { contentWidth: true, wide: true });
		await settle();
		expect(left(document.querySelector('[data-testid="content"]')!)).toBe(24);
		wide.unmount();

		render(SiteHarness, {});
		await settle();
		expect(left(document.querySelector('[data-testid="content"]')!)).toBe(24);
		expect(left(document.querySelector('.ds-topnav .brand')!)).toBe(16);
	});

	it('puts three stats across, a headline value above its label, and sizes an inline FactList in a row', async () => {
		render(SiteHarness, { contentWidth: true });
		await settle();
		const stats = [...document.querySelectorAll('[data-testid="three"] .ds-stat')];
		expect(new Set(stats.map((s) => Math.round(s.getBoundingClientRect().top))).size).toBe(1);
		const value = stats[0].querySelector('.value')!;
		const label = stats[0].querySelector('.label')!;
		expect(value.getBoundingClientRect().bottom).toBeLessThanOrEqual(label.getBoundingClientRect().top + 1);
		expect(getComputedStyle(value).fontWeight).toBe('650');
		const facts = document.querySelector<HTMLElement>('[data-testid="row"] .ds-facts')!;
		expect(facts.getBoundingClientRect().width).toBeGreaterThan(150);
		const dd = facts.querySelector('dd')!;
		expect(dd.getBoundingClientRect().height).toBeLessThan(30);
	});
});

describe('Table striped in a browser', () => {
	// What a role or a mix resolves to inside the table, read off a probe element.
	const resolve = (within: Element, background: string) => {
		const probe = document.createElement('div');
		probe.style.background = background;
		within.append(probe);
		const color = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return color;
	};
	const bodyRows = (name: string) =>
		[...screen.getByRole('table', { name }).querySelectorAll<HTMLTableRowElement>('tbody tr:not(.group-row)')];
	const ground = (row: HTMLTableRowElement) => getComputedStyle(row.cells[row.cells.length - 1]).backgroundColor;

	it('stripes every second row, keeps a selected row tinted and a mark on its stripe', async () => {
		render(StripeHarness);
		await settle();
		const root = screen.getByRole('table', { name: 'Ledger' }).parentElement!;
		const stripe = resolve(root, 'color-mix(in oklab, var(--ds-border-subtle) 45%, var(--ds-bg-1))');
		const tint = resolve(root, 'var(--ds-accent-tint)');
		const rows = bodyRows('Ledger');
		expect(stripe).not.toBe(resolve(root, 'var(--ds-bg-1)'));
		expect(ground(rows[0])).toBe('rgba(0, 0, 0, 0)');
		expect(ground(rows[1])).toBe(stripe);
		expect(ground(rows[2])).toBe('rgba(0, 0, 0, 0)');
		expect(ground(rows[3])).toBe(tint);
		expect(ground(rows[4])).toBe('rgba(0, 0, 0, 0)');
		// The mark's 3px stripe is still drawn on a striped row.
		expect(getComputedStyle(rows[1].cells[0]).boxShadow).toContain('inset');
		expect(getComputedStyle(rows[1].cells[0]).backgroundColor).toBe(stripe);
		// An unstriped table has no stripes.
		for (const row of bodyRows('Plain')) expect(ground(row)).toBe('rgba(0, 0, 0, 0)');
	});

	it('steps hover up to ds-bg-3 on a striped row', async () => {
		render(StripeHarness);
		await settle();
		const root = screen.getByRole('table', { name: 'Ledger' }).parentElement!;
		const rows = bodyRows('Ledger');
		await userEvent.hover(rows[1].cells[1]);
		expect(ground(rows[1])).toBe(resolve(root, 'var(--ds-bg-3)'));
		await userEvent.hover(rows[3].cells[1]);
		expect(ground(rows[3])).toBe(resolve(root, 'var(--ds-accent-tint-hover)'));
		await userEvent.unhover(rows[3].cells[1]);
	});

	it('restarts the stripes in each group', async () => {
		render(StripeHarness);
		await settle();
		const root = screen.getByRole('table', { name: 'Grouped ledger' }).parentElement!;
		const stripe = resolve(root, 'color-mix(in oklab, var(--ds-border-subtle) 45%, var(--ds-bg-1))');
		const striped = bodyRows('Grouped ledger').map((row) => ground(row) === stripe);
		// Ready: Alpha, Bravo, Charlie; On hold: Delta, Echo.
		expect(striped).toEqual([false, true, false, false, true]);
	});
});
