import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import NavRail from './NavRail.svelte';
import PageHeader from './PageHeader.svelte';
import SheetItem from './SheetItem.svelte';
import SideNav from './SideNav.svelte';
import TabBar from './TabBar.svelte';
import Toaster from './Toaster.svelte';
import { badgeText, groupItems, type NavGroup, type NavItem } from '../nav.js';
import { matchesKey } from '../keycap.js';
import { ToastStore } from '../toast.svelte.js';
import TopBarHarness from '../../tests/TopBarHarness.svelte';

const groups: NavGroup[] = [{ id: 'admin', label: 'Admin' }];
const items: NavItem[] = [
	{ id: 'home', label: 'Home', href: '/' },
	{ id: 'records', label: 'Records', href: '/records', badge: 4 },
	{ id: 'reports', label: 'Reports', href: '/reports' },
	{ id: 'sites', label: 'Sites', href: '/sites' },
	{ id: 'users', label: 'Users', href: '/users', group: 'admin', badge: true },
	{ id: 'audit', label: 'Audit log', href: '/audit', group: 'admin' }
];

describe('nav helpers', () => {
	it('groups items in group order, loose items first', () => {
		const sections = groupItems(items, groups);
		expect(sections.map((s) => s.group?.id ?? null)).toEqual([null, 'admin']);
		expect(sections[1].items.map((i) => i.id)).toEqual(['users', 'audit']);
	});

	it('formats badges', () => {
		expect(badgeText(12)).toBe('12');
		expect(badgeText(140)).toBe('99+');
		expect(badgeText(true)).toBe('');
		expect(badgeText(0)).toBeNull();
		expect(badgeText(null)).toBeNull();
	});
});

describe('matchesKey', () => {
	it('matches the plus and minus keys by name', () => {
		expect(matchesKey(new KeyboardEvent('keydown', { key: '+', shiftKey: true }), 'plus')).toBe(true);
		expect(matchesKey(new KeyboardEvent('keydown', { key: '-' }), 'minus')).toBe(true);
	});

	const ev = (key: string, mods: Partial<KeyboardEventInit> = {}) => new KeyboardEvent('keydown', { key, ...mods });
	it('matches plain, named and modified keys', () => {
		expect(matchesKey(ev('z'), 'z')).toBe(true);
		expect(matchesKey(ev('Z', { shiftKey: true }), 'shift+z')).toBe(true);
		expect(matchesKey(ev('Enter'), 'enter')).toBe(true);
		expect(matchesKey(ev('Enter', { shiftKey: true }), 'enter')).toBe(false);
		expect(matchesKey(ev('k', { ctrlKey: true }), 'ctrl+k')).toBe(true);
		expect(matchesKey(ev('k'), 'ctrl+k')).toBe(false);
		expect(matchesKey(ev('?', { shiftKey: true }), '?')).toBe(true);
	});
});

describe('ToastStore', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('shows at most two and expires on time', () => {
		const store = new ToastStore();
		const dismissed = vi.fn();
		store.info('one', { onDismiss: dismissed });
		store.info('two');
		store.info('three');
		expect(store.items.map((t) => t.message)).toEqual(['two', 'three']);
		expect(dismissed).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(4_000);
		expect(store.items).toHaveLength(0);
	});

	it('pauses and resumes', () => {
		const store = new ToastStore();
		const id = store.success('saved');
		vi.advanceTimersByTime(3_000);
		store.pause(id);
		vi.advanceTimersByTime(10_000);
		expect(store.items).toHaveLength(1);
		store.resume(id);
		vi.advanceTimersByTime(1_000);
		expect(store.items).toHaveLength(0);
	});

	it('keeps a sticky toast until it is dismissed, with no countdown', () => {
		const store = new ToastStore();
		const id = store.warning('A new version is available', { duration: null });
		expect(store.items[0]).toMatchObject({ duration: null, countdown: false, deadline: null });
		vi.advanceTimersByTime(60 * 60_000);
		store.pause(id);
		store.resume(id);
		vi.advanceTimersByTime(60 * 60_000);
		expect(store.items).toHaveLength(1);
		store.dismiss(id);
		expect(store.items).toHaveLength(0);
	});

	it('drops the countdown on a sticky action toast', () => {
		const store = new ToastStore();
		store.info('Archived', { duration: null, action: { label: 'Undo', onAction: () => {} } });
		expect(store.items[0].countdown).toBe(false);
	});

	it('replaces a toast pushed with the same id', () => {
		const store = new ToastStore();
		store.push({ id: 'x', message: 'a' });
		store.push({ id: 'x', message: 'b' });
		expect(store.items.map((t) => t.message)).toEqual(['b']);
	});
});

describe('Toaster', () => {
	it('announces failures as alerts and runs an action from its key cap', async () => {
		const store = new ToastStore();
		const onAction = vi.fn();
		render(Toaster, { store });
		store.error('Could not save');
		store.info('Archived', { action: { label: 'Undo', keycap: 'z', onAction } });
		await vi.waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not save'));
		await vi.waitFor(() => expect(screen.getByRole('status').textContent).toContain('Archived. Undo: z'));
		await fireEvent.keyDown(window, { key: 'z' });
		expect(onAction).toHaveBeenCalledTimes(1);
		expect(store.items.map((t) => t.message)).toEqual(['Could not save']);
		store.clear();
	});
});

describe('Toaster hotkeys', () => {
	it('can turn the key binding off and keep the cap', async () => {
		const store = new ToastStore();
		const onAction = vi.fn();
		const { container } = render(Toaster, { store, hotkeys: false });
		store.info('Archived', { action: { label: 'Undo', keycap: 'z', onAction } });
		await vi.waitFor(() => screen.getByRole('button', { name: /Undo/ }));
		await fireEvent.keyDown(window, { key: 'z' });
		expect(onAction).not.toHaveBeenCalled();
		expect(container.querySelector('.ds-kbd')).not.toBeNull();
		store.clear();
	});

	it('leaves a key that the page already handled', async () => {
		const store = new ToastStore();
		const onAction = vi.fn();
		render(Toaster, { store });
		store.info('Archived', { action: { label: 'Undo', keycap: 'z', onAction } });
		await vi.waitFor(() => screen.getByRole('button', { name: /Undo/ }));
		const event = new KeyboardEvent('keydown', { key: 'z', cancelable: true, bubbles: true });
		event.preventDefault();
		window.dispatchEvent(event);
		expect(onAction).not.toHaveBeenCalled();
		store.clear();
	});

	it('shows no countdown on a sticky toast', async () => {
		const store = new ToastStore();
		const { container } = render(Toaster, { store });
		store.info('Archived', { duration: null, action: { label: 'Undo', onAction: () => {} } });
		await vi.waitFor(() => screen.getByRole('button', { name: /Undo/ }));
		expect(container.querySelector('.countdown, .track')).toBeNull();
		store.clear();
	});
});

describe('SheetItem', () => {
	it('marks the current link', () => {
		render(SheetItem, { label: 'Records', href: '/records', current: true });
		expect(screen.getByRole('link', { name: /Records/ }).getAttribute('aria-current')).toBe('page');
	});

	it('is a pressed button when it picks a value', () => {
		render(SheetItem, { label: 'Newest first', current: true, onclick: () => {} });
		expect(screen.getByRole('button', { name: /Newest first/ }).getAttribute('aria-pressed')).toBe('true');
	});
});

describe('NavRail', () => {
	it('lists every item and marks the current page', () => {
		render(NavRail, { items, groups, current: 'records' });
		const nav = screen.getByRole('navigation');
		expect(nav.querySelectorAll('a')).toHaveLength(items.length);
		expect(screen.getByRole('link', { name: /Records/ }).getAttribute('aria-current')).toBe('page');
	});
});

describe('NavRail version', () => {
	it('shows the version collapsed as well as expanded', async () => {
		const { rerender } = render(NavRail, { items, expanded: false, pinned: true, version: 'v2.4.1' });
		expect(screen.getByText('v2.4.1')).toBeTruthy();
		await rerender({ expanded: true });
		expect(screen.getByText('v2.4.1')).toBeTruthy();
	});
});

describe('TabBar', () => {
	it('shows four tabs and puts the rest behind More', () => {
		const { container } = render(TabBar, { items, groups, current: 'users' });
		const tabs = container.querySelectorAll('.ds-tabbar > a');
		expect(tabs).toHaveLength(4);
		const more = screen.getByRole('button', { name: /More/ });
		// The current page is behind More, so More is marked.
		expect(more.hasAttribute('data-current')).toBe(true);
	});
});

describe('SideNav', () => {
	it('renders links and a select that navigates', async () => {
		const onnavigate = vi.fn();
		render(SideNav, { items, groups, current: 'home', label: 'Sections', onnavigate });
		expect(screen.getByRole('link', { name: /Home/ }).getAttribute('aria-current')).toBe('page');
		const select = screen.getByRole('combobox') as HTMLSelectElement;
		await fireEvent.change(select, { target: { value: '/audit' } });
		expect(onnavigate).toHaveBeenCalledWith('/audit');
	});
});

describe('SideNav collapsible groups', () => {
	const sections: NavGroup[] = [
		{ id: 'admin', label: 'Admin' },
		{ id: 'data', label: 'Data', collapsed: false },
		{ id: 'archive', label: 'Archive', collapsed: true }
	];
	const pages: NavItem[] = [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'users', label: 'Users', href: '/users', group: 'admin' },
		{ id: 'imports', label: 'Imports', href: '/imports', group: 'data' },
		{ id: 'old', label: 'Old records', href: '/old', group: 'archive' }
	];
	const expanded = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-expanded');

	it("starts each group as its collapsed option says, and the current page's group open", () => {
		render(SideNav, { items: pages, groups: sections, current: 'home', label: 'Sections', collapsible: true });
		expect(expanded('Admin')).toBe('false');
		expect(expanded('Data')).toBe('true');
		expect(expanded('Archive')).toBe('false');
		// Items outside any group have no toggle and stay listed.
		expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Imports' })).toBeTruthy();
		expect(screen.queryByRole('link', { name: 'Old records' })).toBeNull();
	});

	it('opens a group marked collapsed when it holds the current page, and toggles', async () => {
		render(SideNav, { items: pages, groups: sections, current: 'old', label: 'Sections', collapsible: true });
		expect(expanded('Archive')).toBe('true');
		await fireEvent.click(screen.getByRole('button', { name: 'Data' }));
		expect(expanded('Data')).toBe('false');
		expect(screen.queryByRole('link', { name: 'Imports' })).toBeNull();
	});

	it("describes an item with its description", () => {
		render(SideNav, {
			items: [{ id: 'keys', label: 'Keys', href: '/keys', description: 'Tokens for scripts and services' }],
			current: 'keys',
			label: 'Sections'
		});
		const link = screen.getByRole('link', { name: 'Keys' });
		const tip = document.getElementById(link.getAttribute('aria-describedby')!)!;
		expect(tip.getAttribute('role')).toBe('tooltip');
		expect(tip.textContent).toBe('Tokens for scripts and services');
	});
});

describe('PageHeader', () => {
	it('renders a heading with its count', () => {
		render(PageHeader, { title: 'Records', count: 1284 });
		const h = screen.getByRole('heading', { level: 1 });
		expect(h.textContent).toContain('Records');
		expect(document.body.textContent).toContain('1,284');
	});

	it('sets an identifier title in mono', () => {
		render(PageHeader, { title: 'R-00412', mono: true });
		expect(screen.getByRole('heading', { name: 'R-00412' }).hasAttribute('data-mono')).toBe(true);
	});
});

describe('TopBar', () => {
	it('focuses its search on /, unless the key is handed to the page', async () => {
		const { rerender } = render(TopBarHarness);
		const search = screen.getByRole('textbox', { name: 'Search records' });
		await fireEvent.keyDown(window, { key: '/' });
		expect(document.activeElement).toBe(search);
		search.blur();
		await rerender({ searchKey: null });
		await fireEvent.keyDown(window, { key: '/' });
		expect(document.activeElement).not.toBe(search);
	});
});
