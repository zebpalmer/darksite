import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render, screen } from '@testing-library/svelte';
import WorkView from './WorkView.svelte';

const html = (markup: string) => createRawSnippet(() => ({ render: () => markup }));

describe('WorkView', () => {
	it('lays out the header, the rail beside the results, and the footer under them', () => {
		const { container } = render(WorkView, {
			label: 'Records',
			header: html('<header class="h">Records</header>'),
			rail: html('<aside class="r">Filters</aside>'),
			top: html('<div class="t">Active</div>'),
			footer: html('<div class="f">Actions</div>'),
			children: html('<div class="ds-table">rows</div>')
		});
		const root = container.querySelector('.ds-workview') as HTMLElement;
		expect(root.querySelector(':scope > .head .h')).toBeTruthy();
		const frame = root.querySelector(':scope > .frame') as HTMLElement;
		expect(frame.querySelector(':scope > .rail .r')).toBeTruthy();
		const results = frame.querySelector(':scope > .results') as HTMLElement;
		expect([...results.children].map((c) => c.className.split(' ')[0])).toEqual(['top', 'body', 'foot']);
		// The results region is named, and a Table sits straight in it, so it can own the scroll.
		const body = screen.getByRole('region', { name: 'Records' });
		expect(body.querySelector(':scope > .ds-table')).toBeTruthy();
	});

	it('renders only what it is given', () => {
		const { container } = render(WorkView, { children: html('<p>rows</p>') });
		expect(container.querySelector('.head')).toBeNull();
		expect(container.querySelector('.rail')).toBeNull();
		expect(container.querySelector('.foot')).toBeNull();
		expect(screen.queryByRole('region')).toBeNull();
		expect(screen.getByText('rows')).toBeTruthy();
	});
});
