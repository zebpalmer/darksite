import { describe, expect, it, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Banner from './Banner.svelte';
import NavRail from './NavRail.svelte';
import SkeletonLoader from './SkeletonLoader.svelte';
import type { NavItem } from '../nav.js';

const items: NavItem[] = [
	{ id: 'home', label: 'Home', href: '/' },
	{ id: 'records', label: 'Records', href: '/records', badge: 4 }
];

describe('NavRail slots', () => {
	it('renders search and status slots with the expanded state', () => {
		const search = createRawSnippet((args: () => { expanded: boolean }) => ({
			render: () => `<button type="button">${args().expanded ? 'Search records' : 'Search'}</button>`
		}));
		const status = createRawSnippet(() => ({ render: () => '<span>Synced</span>' }));
		render(NavRail, { items, expanded: true, search, status });
		expect(screen.getByRole('button', { name: 'Search records' })).toBeTruthy();
		expect(screen.getByText('Synced')).toBeTruthy();
	});

	it('replaces the default badge with the badge slot', () => {
		const badge = createRawSnippet((args: () => { item: NavItem }) => ({
			render: () => `<span class="custom">${args().item.id}</span>`
		}));
		const { container } = render(NavRail, { items, expanded: true, badge });
		expect(container.querySelectorAll('.custom')).toHaveLength(2);
		expect(container.querySelector('.badge')).toBeNull();
	});

	it('shows no toggle when pinned', () => {
		render(NavRail, { items, expanded: false, pinned: true });
		expect(screen.queryByRole('button', { name: /navigation/ })).toBeNull();
	});
});

describe('Banner remember', () => {
	it('comes back on the next load when remember is off', async () => {
		localStorage.clear();
		const ondismiss = vi.fn();
		const props = {
			id: 'update',
			message: 'A new version is available.',
			dismissible: true,
			remember: false,
			ondismiss
		};
		const { unmount } = render(Banner, props);
		await fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
		expect(screen.queryByRole('status')).toBeNull();
		expect(ondismiss).toHaveBeenCalledTimes(1);
		unmount();
		render(Banner, props);
		expect(screen.getByRole('status')).toBeTruthy();
		expect(localStorage.length).toBe(0);
	});
});

describe('SkeletonLoader grid', () => {
	it('draws a Grid of card placeholders as one status', () => {
		const { container } = render(SkeletonLoader, { variant: 'grid', count: 6, density: 's' });
		expect(screen.getAllByRole('status')).toHaveLength(1);
		const grid = container.querySelector('.ds-grid') as HTMLElement;
		expect(grid.style.getPropertyValue('--card-min')).toBe('180px');
		expect(grid.querySelectorAll('.card')).toHaveLength(6);
	});

	it('draws entity rows for a row grid, eight by default', () => {
		const { container } = render(SkeletonLoader, { variant: 'grid', min: 280, label: null });
		expect(screen.queryByRole('status')).toBeNull();
		expect(container.querySelectorAll('.entity')).toHaveLength(8);
	});
});
