import { describe, expect, it, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ListRow from './ListRow.svelte';

const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe('ListRow', () => {
	it('is a link with its title and meta, marked current', () => {
		const { container } = render(ListRow, {
			title: 'R-00412',
			meta: 'Field team · 6 min ago',
			href: '/records/412',
			current: true
		});
		const link = screen.getByRole('link');
		expect(link.getAttribute('href')).toBe('/records/412');
		expect(link.getAttribute('aria-current')).toBe('page');
		expect(link.textContent).toContain('Field team · 6 min ago');
		const row = container.querySelector('li.ds-listrow') as HTMLElement;
		expect(row.dataset.lines).toBe('1');
		expect(row.hasAttribute('data-current')).toBe(true);
	});

	it('is a button with onclick, and keeps trailing controls outside it', async () => {
		const onclick = vi.fn();
		render(ListRow, {
			title: 'A. Rivera',
			onclick,
			trailing: snippet('<button type="button">Remove</button>'),
			leading: snippet('<span>AR</span>')
		});
		const main = screen.getByRole('button', { name: /A\. Rivera/ });
		await fireEvent.click(main);
		expect(onclick).toHaveBeenCalledTimes(1);
		const remove = screen.getByRole('button', { name: 'Remove' });
		expect(main.contains(remove)).toBe(false);
	});

	it('is static with neither, two-line and dense on request', () => {
		const { container } = render(ListRow, {
			title: 'Nightly import',
			meta: 'Ran 3 h ago',
			lines: 2,
			dense: true,
			selected: true,
			as: 'div'
		});
		expect(screen.queryByRole('link')).toBeNull();
		expect(screen.queryByRole('button')).toBeNull();
		const row = container.querySelector('div.ds-listrow') as HTMLElement;
		expect(row.dataset.lines).toBe('2');
		expect(row.hasAttribute('data-dense')).toBe(true);
		expect(row.hasAttribute('data-selected')).toBe(true);
	});

	it('disables its button', () => {
		render(ListRow, { title: 'Archived', onclick: () => {}, disabled: true });
		expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
	});
});
