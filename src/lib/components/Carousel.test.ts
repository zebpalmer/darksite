import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { tick } from 'svelte';
import CarouselHarness from '../../tests/CarouselHarness.svelte';

const settle = async () => {
	await tick();
	await tick();
};

describe('Carousel', () => {
	it('is a titled region holding a named list of tiles', async () => {
		render(CarouselHarness, { href: '/recent' });
		await settle();
		const region = screen.getByRole('region', { name: 'Recent' });
		expect(within(region).getByRole('heading', { level: 2, name: 'Recent' })).toBeTruthy();
		const list = within(region).getByRole('list', { name: 'Recent' });
		expect(within(list).getAllByRole('listitem')).toHaveLength(4);
		const seeAll = within(region).getByRole('link', { name: 'See all: Recent' });
		expect(seeAll.getAttribute('href')).toBe('/recent');
	});

	it('is one tab stop: only the current tile is in the tab order', async () => {
		render(CarouselHarness);
		await settle();
		const links = screen.getAllByRole('link');
		expect(links.map((l) => l.tabIndex)).toEqual([0, -1, -1, -1]);
	});

	it('moves between tiles with the arrow keys, Home and End', async () => {
		render(CarouselHarness);
		await settle();
		const links = screen.getAllByRole('link');
		links[0].focus();
		await fireEvent.keyDown(links[0], { key: 'ArrowRight' });
		expect(document.activeElement).toBe(links[1]);
		expect(links[1].tabIndex).toBe(0);
		expect(links[0].tabIndex).toBe(-1);
		await fireEvent.keyDown(links[1], { key: 'End' });
		expect(document.activeElement).toBe(links[3]);
		await fireEvent.keyDown(links[3], { key: 'ArrowRight' });
		expect(document.activeElement).toBe(links[3]);
		await fireEvent.keyDown(links[3], { key: 'Home' });
		expect(document.activeElement).toBe(links[0]);
		await fireEvent.keyDown(links[0], { key: 'ArrowLeft' });
		expect(document.activeElement).toBe(links[0]);
	});

	it('follows focus that arrives by other means', async () => {
		render(CarouselHarness);
		await settle();
		const links = screen.getAllByRole('link');
		links[2].focus();
		await fireEvent.focusIn(links[2]);
		expect(links[2].tabIndex).toBe(0);
		expect(links[0].tabIndex).toBe(-1);
	});

	it('makes a track of static tiles focusable so it can still be scrolled', async () => {
		render(CarouselHarness, { plain: true });
		await settle();
		expect(screen.getByRole('list', { name: 'Recent' }).getAttribute('tabindex')).toBe('0');
	});

	it('keeps the scroll buttons out of the tab order and the accessibility tree', async () => {
		const { container } = render(CarouselHarness);
		await settle();
		const buttons = container.querySelectorAll('button.nav');
		expect(buttons).toHaveLength(2);
		buttons.forEach((b) => {
			expect(b.getAttribute('tabindex')).toBe('-1');
			expect(b.getAttribute('aria-hidden')).toBe('true');
		});
	});

	it('shows a skeleton while loading', async () => {
		render(CarouselHarness, { loading: true });
		await settle();
		expect(screen.getByRole('status').textContent).toContain('Loading');
		expect(screen.queryByRole('list')).toBeNull();
	});

	it('renders nothing when empty, unless it has an empty state', async () => {
		const { container, unmount } = render(CarouselHarness, { count: 0 });
		expect(container.querySelector('.ds-carousel')).toBeNull();
		unmount();
		render(CarouselHarness, { count: 0, withEmpty: true });
		expect(screen.getByRole('region', { name: 'Recent' }).textContent).toContain(
			'Nothing here yet'
		);
	});
});
