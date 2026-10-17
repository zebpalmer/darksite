import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import AppShell from './AppShell.svelte';
import FullBleed from './FullBleed.svelte';
import Intro from './Intro.svelte';
import LinkCard from './LinkCard.svelte';
import Steps from './Steps.svelte';
import TopNav from './TopNav.svelte';
import type { NavGroup, NavItem } from '../nav.js';

const text = (html: string) => createRawSnippet(() => ({ render: () => html }));
const groups: NavGroup[] = [{ id: 'records', label: 'Records' }];
const items: NavItem[] = [
	{ id: 'home', label: 'Home', href: '/' },
	{ id: 'sites', label: 'Sites', href: '/sites', group: 'records' },
	{ id: 'reports', label: 'Reports', href: '/reports', group: 'records', badge: 3 }
];

describe('TopNav', () => {
	it('links loose items and opens a group as a menu of links', async () => {
		render(TopNav, { items, groups, current: 'reports', product: 'Acme' });
		const nav = screen.getByRole('navigation', { name: 'Primary' });
		expect(within(nav).getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/');
		const button = within(nav).getByRole('button', { name: 'Records' });
		expect(button.getAttribute('aria-expanded')).toBe('false');
		expect(button.hasAttribute('data-current')).toBe(true);
		await fireEvent.click(button);
		expect(button.getAttribute('aria-expanded')).toBe('true');
		const reports = screen.getByRole('link', { name: /Reports/ });
		expect(reports.getAttribute('aria-current')).toBe('page');
		expect(button.getAttribute('aria-controls')).toBeTruthy();
		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(button.getAttribute('aria-expanded')).toBe('false');
	});

	it('keeps the list order, menus and links mixed', () => {
		render(TopNav, {
			groups: [
				{ id: 'records', label: 'Records' },
				{ id: 'guides', label: 'Guides' }
			],
			items: [
				{ id: 'sites', label: 'Sites', href: '/sites', group: 'records' },
				{ id: 'start', label: 'Start', href: '/start', group: 'guides' },
				{ id: 'news', label: 'News', href: '/news' },
				{ id: 'reports', label: 'Reports', href: '/reports', group: 'records' }
			]
		});
		const nav = screen.getByRole('navigation', { name: 'Primary' });
		const order = [...nav.querySelectorAll('.link')].map((el) => el.textContent?.trim());
		expect(order).toEqual(['Records', 'Guides', 'News']);
	});

	it('links the product name home', () => {
		render(TopNav, { items, groups, product: 'Acme', homeHref: '/start' });
		expect(screen.getByRole('link', { name: 'Acme' }).getAttribute('href')).toBe('/start');
	});
});

describe('AppShell nav="top"', () => {
	it('draws a top bar instead of a rail and tab bar, with the footer', () => {
		const { container } = render(AppShell, {
			nav: 'top',
			items,
			groups,
			current: 'home',
			footer: text('<p>v1.2.3</p>'),
			children: text('<p>Page</p>')
		});
		expect(container.querySelector('.ds-topnav')).toBeTruthy();
		expect(container.querySelector('.ds-navrail')).toBeNull();
		expect(container.querySelector('.ds-tabbar')).toBeNull();
		expect(screen.getByRole('contentinfo').textContent).toContain('v1.2.3');
	});
});

describe('page types', () => {
	it('Intro is a heading, a lead and its actions', () => {
		render(Intro, { title: 'Every site, on record', lead: 'Inspected and filed.', actions: text('<a href="/map">Open the map</a>') });
		expect(screen.getByRole('heading', { level: 1, name: 'Every site, on record' })).toBeTruthy();
		expect(screen.getByText('Inspected and filed.')).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Open the map' })).toBeTruthy();
	});

	it('Steps is an ordered list with links', () => {
		render(Steps, {
			label: 'Get started',
			steps: [{ title: 'Pick a site', href: '/find', linkLabel: 'Search' }, { title: 'Run a check' }]
		});
		const list = screen.getByRole('list', { name: 'Get started' });
		expect(list.tagName).toBe('OL');
		expect(within(list).getAllByRole('listitem')).toHaveLength(2);
		expect(screen.getByRole('link', { name: 'Search' }).getAttribute('href')).toBe('/find');
	});

	it('Steps links the title of a step with an href, and adds a separate link only with linkLabel', () => {
		render(Steps, { steps: [{ title: 'Pick a site', href: '/find' }, { title: 'Run a check', href: '/run', linkLabel: 'Open checklists' }] });
		const links = screen.getAllByRole('link');
		expect(links.map((l) => [l.textContent?.trim(), l.getAttribute('href')])).toEqual([
			['Pick a site', '/find'],
			['Open checklists', '/run']
		]);
		expect(screen.getByText('Run a check').closest('a')).toBeNull();
	});

	it('Steps is a plain list by default, and tiles with variant="cards"', () => {
		const steps = [{ title: 'Pick a site' }, { title: 'Run a check' }];
		const { container, unmount } = render(Steps, { steps });
		expect(container.querySelector('.ds-steps')!.getAttribute('data-variant')).toBe('list');
		unmount();
		const cards = render(Steps, { steps, variant: 'cards' });
		expect(cards.container.querySelector('.ds-steps')!.getAttribute('data-variant')).toBe('cards');
	});

	it('LinkCard is one link, and says when it opens a new tab', () => {
		render(LinkCard, { href: 'https://example.com', title: 'Docs', text: 'How it works.', external: true });
		const link = screen.getByRole('link', { name: /Docs/ });
		expect(link.getAttribute('target')).toBe('_blank');
		expect(link.textContent).toContain('opens in a new tab');
	});

	it('FullBleed is a named region', () => {
		render(FullBleed, { label: 'Map', children: text('<div>canvas</div>') });
		expect(screen.getByRole('region', { name: 'Map' }).classList.contains('ds-fullbleed')).toBe(true);
	});
});
