import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Pager from './Pager.svelte';
import { pageFromUrl, pageHref } from '../pager.js';

describe('pageFromUrl and pageHref', () => {
	it('reads a whole page number from 1, and 1 for anything else', () => {
		expect(pageFromUrl('https://example.com/list?page=3')).toBe(3);
		expect(pageFromUrl('/list?p=2', 'p')).toBe(2);
		for (const bad of ['', '?page=0', '?page=-2', '?page=2.5', '?page=abc'])
			expect(pageFromUrl(`/list${bad}`)).toBe(1);
	});

	it('keeps the rest of the URL and drops the parameter on page 1', () => {
		const url = new URL('https://example.com/list?q=alpha&page=3#top');
		expect(pageHref(url, 4)).toBe('/list?q=alpha&page=4#top');
		expect(pageHref(url, 1)).toBe('/list?q=alpha#top');
		expect(pageHref('/list', 2, 'p')).toBe('/list?p=2');
	});
});

describe('Pager', () => {
	const link = (name: string) => screen.getByRole('link', { name });

	it('reads the page from the URL and links to its neighbors', () => {
		render(Pager, { url: 'https://example.com/list?q=a&page=2', total: 295 });
		expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeTruthy();
		expect(link('Newer').getAttribute('href')).toBe('/list?q=a');
		expect(link('Newer').getAttribute('rel')).toBe('prev');
		expect(link('Older').getAttribute('href')).toBe('/list?q=a&page=3');
		expect(link('Older').getAttribute('rel')).toBe('next');
		const range = screen.getByText('51–100 of 295');
		expect(range.getAttribute('aria-hidden')).toBe('true');
		expect(screen.getByText('51 to 100 of 295')).toBeTruthy();
	});

	it('disables Newer on the first page and Older on the last, in place', () => {
		const { unmount } = render(Pager, { url: '/list', total: 295 });
		expect(link('Newer').hasAttribute('href')).toBe(false);
		expect(link('Newer').getAttribute('aria-disabled')).toBe('true');
		expect(link('Older').getAttribute('href')).toBe('/list?page=2');
		unmount();
		render(Pager, { url: '/list?page=6', total: 295 });
		expect(screen.getByText('251–295 of 295')).toBeTruthy();
		expect(link('Older').getAttribute('aria-disabled')).toBe('true');
		expect(link('Newer').getAttribute('href')).toBe('/list?page=5');
	});

	it('takes hasMore when the total is unknown', () => {
		render(Pager, { page: 3, pageSize: 20, hasMore: true, href: (n: number) => `/feed/${n}` });
		expect(screen.getByText('41–60')).toBeTruthy();
		expect(link('Older').getAttribute('href')).toBe('/feed/4');
		expect(link('Newer').getAttribute('href')).toBe('/feed/2');
	});

	it('says "0 of 0" for an empty list, with both ends disabled', () => {
		render(Pager, { url: '/list', total: 0, newerLabel: 'Previous', olderLabel: 'Next' });
		expect(screen.getAllByText('0 of 0')).toHaveLength(2);
		expect(link('Previous').getAttribute('aria-disabled')).toBe('true');
		expect(link('Next').getAttribute('aria-disabled')).toBe('true');
	});
});
