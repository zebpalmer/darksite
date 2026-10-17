import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { PHONE_QUERY } from '../media.svelte.js';
import ShellHarness from '../../tests/ShellHarness.svelte';

// One controllable phone query for the whole file: `media.phone` reads it from the first render on.
type Listener = () => void;
const listeners = new Set<Listener>();
const phoneList = {
	matches: false,
	media: PHONE_QUERY,
	addEventListener: (_: string, fn: Listener) => listeners.add(fn),
	removeEventListener: (_: string, fn: Listener) => listeners.delete(fn)
};
const otherList = { matches: false, addEventListener() {}, removeEventListener() {} };
vi.stubGlobal('matchMedia', (query: string) => (query === PHONE_QUERY ? phoneList : otherList));

function setPhone(value: boolean) {
	phoneList.matches = value;
	for (const fn of listeners) fn();
	flushSync();
}

const header = () => screen.getByRole('banner');

describe('AppShell headerActions', () => {
	it('renders them in the page header, ahead of the page actions', () => {
		setPhone(false);
		render(ShellHarness);
		const find = screen.getByRole('searchbox', { name: 'Find' });
		const add = screen.getByRole('button', { name: 'New record' });
		expect(header().contains(find)).toBe(true);
		expect(find.compareDocumentPosition(add) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	it('focuses the first field on /, and can hand the key to the page', async () => {
		setPhone(false);
		const { rerender } = render(ShellHarness);
		const find = screen.getByRole('searchbox', { name: 'Find' });
		await fireEvent.keyDown(window, { key: '/' });
		expect(document.activeElement).toBe(find);
		find.blur();
		await rerender({ headerActionsKey: null });
		await fireEvent.keyDown(window, { key: '/' });
		expect(document.activeElement).not.toBe(screen.getByRole('searchbox', { name: 'Find' }));
	});

	it('shows nothing in a level-1 header that opts out', async () => {
		setPhone(false);
		render(ShellHarness, { shellActions: false });
		expect(screen.queryByRole('searchbox', { name: 'Find' })).toBeNull();
		expect(screen.queryByRole('region', { name: 'Toolbar' })).toBeNull();
		expect(screen.getByRole('button', { name: 'New record' })).toBeTruthy();
	});

	it('leaves PageHeader unchanged when the shell has none', () => {
		setPhone(false);
		render(ShellHarness, { withActions: false });
		expect(screen.queryByRole('searchbox')).toBeNull();
		expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
	});
});

describe('AppShell headerActions on a phone', () => {
	it('collapses to an icon button that opens a row and moves focus into it', async () => {
		setPhone(true);
		render(ShellHarness);
		expect(screen.queryByRole('searchbox', { name: 'Find' })).toBeNull();
		const toggle = screen.getByRole('button', { name: 'Search' });
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
		// The page's own action stays right-most.
		expect(toggle.compareDocumentPosition(screen.getByRole('button', { name: 'New record' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		await fireEvent.click(toggle);
		const row = screen.getByRole('region', { name: 'Search' });
		expect(toggle.getAttribute('aria-expanded')).toBe('true');
		expect(toggle.getAttribute('aria-controls')).toBe(row.id);
		expect(header().contains(row)).toBe(true);
		expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Find' }));
		await fireEvent.click(toggle);
		expect(screen.queryByRole('region', { name: 'Search' })).toBeNull();
	});

	it('opens the row on the shortcut key and focuses its field', async () => {
		setPhone(true);
		render(ShellHarness);
		await fireEvent.keyDown(window, { key: '/' });
		expect(screen.getByRole('region', { name: 'Search' })).toBeTruthy();
		expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Find' }));
	});

	it('closes on Esc from inside the row and returns focus to the toggle', async () => {
		setPhone(true);
		render(ShellHarness);
		const toggle = screen.getByRole('button', { name: 'Search' });
		await fireEvent.click(toggle);
		await fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Find' }), { key: 'Escape' });
		expect(screen.queryByRole('region', { name: 'Search' })).toBeNull();
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(toggle);
	});

	it('stays open when something inside already handled Esc', async () => {
		setPhone(true);
		render(ShellHarness);
		await fireEvent.click(screen.getByRole('button', { name: 'Search' }));
		const find = screen.getByRole('searchbox', { name: 'Find' });
		find.addEventListener('keydown', (event) => event.preventDefault());
		await fireEvent.keyDown(find, { key: 'Escape' });
		expect(screen.getByRole('region', { name: 'Search' })).toBeTruthy();
	});

	it('closes on navigation and when the phone layout ends', async () => {
		setPhone(true);
		const { rerender } = render(ShellHarness);
		await fireEvent.click(screen.getByRole('button', { name: 'Search' }));
		await rerender({ current: 'records' });
		expect(screen.queryByRole('region', { name: 'Search' })).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: 'Search' }));
		setPhone(false);
		expect(screen.queryByRole('region', { name: 'Search' })).toBeNull();
		expect(screen.getByRole('searchbox', { name: 'Find' })).toBeTruthy();
		setPhone(true);
		expect(screen.queryByRole('region', { name: 'Search' })).toBeNull();
	});
});

describe('AppShell headerActions on a page without a level-1 PageHeader', () => {
	it('shows them in a slim bar the shell adds, and only while no level-1 header claims them', async () => {
		setPhone(false);
		const { rerender } = render(ShellHarness, { header: false });
		const bar = screen.getByRole('region', { name: 'Toolbar' });
		expect(bar.dataset.variant).toBe('slim');
		expect(bar.contains(screen.getByRole('searchbox', { name: 'Find' }))).toBe(true);
		// A level-2 header does not claim them.
		await rerender({ header: true, level: 2 });
		expect(screen.getByRole('region', { name: 'Toolbar' }).contains(screen.getByRole('searchbox', { name: 'Find' }))).toBe(true);
		expect(header().querySelector('input')).toBeNull();
		await rerender({ level: 1 });
		expect(screen.queryByRole('region', { name: 'Toolbar' })).toBeNull();
		expect(screen.getAllByRole('searchbox', { name: 'Find' })).toHaveLength(1);
		expect(header().contains(screen.getByRole('searchbox', { name: 'Find' }))).toBe(true);
	});

	it("shows them in the shell's TopBar, ahead of its own actions", async () => {
		setPhone(false);
		const { rerender } = render(ShellHarness, { header: false, withTopBar: true });
		const bar = screen.getByRole('region', { name: 'Section' });
		const find = screen.getByRole('searchbox', { name: 'Find' });
		expect(bar.contains(find)).toBe(true);
		expect(find.compareDocumentPosition(screen.getByRole('button', { name: 'Create' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		await fireEvent.keyDown(window, { key: '/' });
		expect(document.activeElement).toBe(find);
		find.blur();
		await rerender({ header: true });
		expect(bar.contains(screen.getByRole('searchbox', { name: 'Find' }))).toBe(false);
		expect(screen.getByRole('button', { name: 'Create' })).toBeTruthy();
	});

	it('shows none with headerActionsFallback={false}', () => {
		setPhone(false);
		render(ShellHarness, { header: false, headerActionsFallback: false });
		expect(screen.queryByRole('searchbox', { name: 'Find' })).toBeNull();
		expect(screen.queryByRole('region', { name: 'Toolbar' })).toBeNull();
	});

	it('collapses on a phone to an icon button that opens a row under the bar', async () => {
		setPhone(true);
		render(ShellHarness, { header: false, withTopBar: true });
		expect(screen.queryByRole('searchbox', { name: 'Find' })).toBeNull();
		const toggle = screen.getByRole('button', { name: 'Search' });
		await fireEvent.click(toggle);
		const row = screen.getByRole('region', { name: 'Search' });
		expect(screen.getByRole('region', { name: 'Section' }).contains(row)).toBe(true);
		expect(toggle.getAttribute('aria-controls')).toBe(row.id);
		expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Find' }));
		await fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Find' }), { key: 'Escape' });
		expect(screen.queryByRole('region', { name: 'Search' })).toBeNull();
		expect(document.activeElement).toBe(toggle);
		await fireEvent.keyDown(window, { key: '/' });
		expect(screen.getByRole('region', { name: 'Search' })).toBeTruthy();
	});
});

describe('AppShell headerActions in a top-nav shell', () => {
	const topnav = () => document.querySelector<HTMLElement>('.ds-topnav')!;

	it('shows them in the TopNav, not in an added bar, while no level-1 header claims them', async () => {
		setPhone(false);
		const { rerender } = render(ShellHarness, { nav: 'top', header: false });
		expect(screen.queryByRole('region', { name: 'Toolbar' })).toBeNull();
		const find = screen.getByRole('searchbox', { name: 'Find' });
		expect(topnav().contains(find)).toBe(true);
		await fireEvent.keyDown(window, { key: '/' });
		expect(document.activeElement).toBe(find);
		find.blur();
		await rerender({ header: true });
		expect(topnav().querySelector('input')).toBeNull();
		expect(screen.getAllByRole('searchbox', { name: 'Find' })).toHaveLength(1);
	});

	it("leaves them to the shell's TopBar when there is one", () => {
		setPhone(false);
		render(ShellHarness, { nav: 'top', header: false, withTopBar: true });
		expect(topnav().querySelector('input')).toBeNull();
		expect(screen.getByRole('region', { name: 'Section' }).contains(screen.getByRole('searchbox', { name: 'Find' }))).toBe(true);
	});

	it('collapses on a phone to an icon beside the menu button that opens a row under the bar', async () => {
		setPhone(true);
		render(ShellHarness, { nav: 'top', header: false });
		expect(screen.queryByRole('searchbox', { name: 'Find' })).toBeNull();
		const toggle = screen.getByRole('button', { name: 'Search' });
		expect(topnav().contains(toggle)).toBe(true);
		await fireEvent.click(toggle);
		const row = screen.getByRole('region', { name: 'Search' });
		expect(topnav().contains(row)).toBe(true);
		expect(toggle.getAttribute('aria-controls')).toBe(row.id);
		expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Find' }));
		await fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Find' }), { key: 'Escape' });
		expect(screen.queryByRole('region', { name: 'Search' })).toBeNull();
		expect(document.activeElement).toBe(toggle);
	});
});
