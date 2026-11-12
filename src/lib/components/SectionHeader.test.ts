import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render, screen } from '@testing-library/svelte';
import SectionHeader from './SectionHeader.svelte';

describe('SectionHeader', () => {
	it('is a level-2 heading with its count in the name', () => {
		render(SectionHeader, { title: 'Needs review', count: 3 });
		const h = screen.getByRole('heading', { level: 2, name: /^Needs review:\s*3$/ });
		expect(h.querySelector('.count')?.textContent?.trim()).toBe('3');
	});

	it('shows a count of zero and hides an absent one', () => {
		const { unmount } = render(SectionHeader, { title: 'Queue', count: 0 });
		expect(screen.getByRole('heading').querySelector('.count')?.textContent?.trim()).toBe('0');
		unmount();
		render(SectionHeader, { title: 'Queue' });
		expect(screen.getByRole('heading', { name: 'Queue' }).querySelector('.count')).toBeNull();
	});

	it('localizes a large count', () => {
		render(SectionHeader, { title: 'Records', count: 12840 });
		expect(screen.getByRole('heading').querySelector('.count')?.textContent?.trim()).toBe(
			(12840).toLocaleString()
		);
	});

	it('takes level 3, a tone and an id', () => {
		render(SectionHeader, { title: 'Held', count: 2, level: 3, tone: 'danger', id: 'held' });
		const h = screen.getByRole('heading', { level: 3 });
		expect(h.id).toBe('held');
		expect(h.querySelector('.count')?.getAttribute('data-tone')).toBe('danger');
	});

	it('renders its actions beside the heading', () => {
		const actions = createRawSnippet(() => ({ render: () => '<button>Export</button>' }));
		render(SectionHeader, { title: 'Queue', actions });
		expect(screen.getByRole('button', { name: 'Export' })).toBeTruthy();
	});
});
