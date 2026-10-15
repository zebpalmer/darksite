import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render, screen } from '@testing-library/svelte';
import ActionBar from './ActionBar.svelte';
import EmptyState from './EmptyState.svelte';
import EntityCard from './EntityCard.svelte';
import KeyCap from './KeyCap.svelte';
import NewBadge from './NewBadge.svelte';
import Spinner from './Spinner.svelte';
import StatRow from './StatRow.svelte';

const text = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe('small components', () => {
	it('ActionBar is a named group of actions', () => {
		render(ActionBar, { label: 'Review actions', children: text('<button>Approve</button>') });
		const bar = screen.getByRole('group', { name: 'Review actions' });
		expect(bar.textContent).toContain('Approve');
	});

	it('EmptyState says what is empty and offers its action', () => {
		render(EmptyState, {
			title: 'No records yet',
			message: 'Records you add show here.',
			action: text('<button>Add record</button>')
		});
		expect(screen.getByText('No records yet')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Add record' })).toBeTruthy();
	});

	it('EntityCard is one link named by the entity, with its code and meta', () => {
		render(EntityCard, { href: '/people/1', name: 'Grace Hopper', code: 'RV', meta: 'Reviewer · 9 records' });
		const link = screen.getByRole('link');
		expect(link.getAttribute('href')).toBe('/people/1');
		expect(link.textContent).toContain('Grace Hopper');
		expect(link.textContent).toContain('Reviewer · 9 records');
		expect(screen.getByRole('img', { name: 'Grace Hopper' }).textContent).toBe('GH');
	});

	it('KeyCap shows a token as keys and hides itself when decorative', () => {
		const { container } = render(KeyCap, { keys: 'shift+enter', decorative: true });
		const kbd = container.querySelector('kbd')!;
		expect(kbd.textContent?.length).toBeGreaterThan(0);
		expect(kbd.getAttribute('aria-hidden')).toBe('true');
	});

	it('NewBadge reads "new"', () => {
		const { container } = render(NewBadge);
		expect(container.textContent?.trim()).toBe('new');
	});

	it('Spinner is a status only when it has a label', () => {
		const { container, unmount } = render(Spinner);
		expect(container.querySelector('[role="status"]')).toBeNull();
		unmount();
		render(Spinner, { label: 'Loading records' });
		expect(screen.getByRole('status').textContent).toContain('Loading records');
	});

	it('StatRow groups its stats under a name', () => {
		render(StatRow, { label: 'This week', children: text('<div>12 open</div>') });
		expect(screen.getByRole('group', { name: 'This week' }).textContent).toContain('12 open');
	});
});
