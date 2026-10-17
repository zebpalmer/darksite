import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import SearchHarness from '../../tests/SearchHarness.svelte';
import { searchShortcut, type SearchGroup } from './SearchPalette.svelte';

afterEach(() => {
	vi.useRealTimers();
});

async function openWith(query: string, props: Record<string, unknown> = {}) {
	render(SearchHarness, props);
	await fireEvent.click(screen.getByRole('button', { name: 'Open search' }));
	const input = screen.getByRole('combobox', { name: 'Search' });
	await fireEvent.input(input, { target: { value: query } });
	return input as HTMLInputElement;
}

const options = () => screen.queryAllByRole('option');

describe('SearchPalette', () => {
	it('is a dialog with a combobox over a listbox of grouped options', async () => {
		const input = await openWith('a');
		expect(screen.getByRole('dialog', { name: 'Search' })).toBeTruthy();
		const list = await screen.findByRole('listbox', { name: 'Results' });
		expect(input.getAttribute('aria-expanded')).toBe('true');
		expect(input.getAttribute('aria-controls')).toBe(list.id);
		const groups = within(list).getAllByRole('group');
		expect(groups.map((g) => g.getAttribute('aria-labelledby') && document.getElementById(g.getAttribute('aria-labelledby')!)?.textContent)).toEqual(['People', 'Records', 'Docs']);
		// Capped at five under All, with "All 7" to scope to the rest.
		expect(within(groups[1]).getAllByRole('option')).toHaveLength(5);
		expect(groups[1].querySelector('.all')?.textContent).toBe('All 7');
		// The first row is active, so Enter opens the best match.
		const first = options()[0];
		expect(first.getAttribute('aria-selected')).toBe('true');
		expect(input.getAttribute('aria-activedescendant')).toBe(first.id);
		// Rows are real links.
		expect(first.tagName).toBe('A');
		expect(first.getAttribute('href')).toBe('#people/rivera');
	});

	it('scopes to one group from a chip or "All N", with counts on the chips', async () => {
		await openWith('r');
		await screen.findByRole('listbox');
		const scopes = screen.getByRole('group', { name: 'Search in' });
		const chips = within(scopes).getAllByRole('button');
		expect(chips.map((c) => c.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
			'All 10',
			'People 2',
			'Records 7',
			'Docs 1'
		]);
		expect(chips[0].getAttribute('aria-pressed')).toBe('true');
		await fireEvent.click(chips[2]);
		expect(chips[2].getAttribute('aria-pressed')).toBe('true');
		expect(within(screen.getByRole('listbox')).getAllByRole('group')).toHaveLength(1);
		expect(options()).toHaveLength(7);
		await fireEvent.click(chips[0]);
		await fireEvent.click(document.querySelector<HTMLElement>('.all')!);
		expect(options()).toHaveLength(7);
		expect(document.activeElement).toBe(screen.getByRole('combobox'));
	});

	it('moves the active row across groups with the arrows, wrapping', async () => {
		const input = await openWith('a');
		await screen.findByRole('listbox');
		const ids = options().map((o) => o.id);
		const active = () => input.getAttribute('aria-activedescendant');
		// Three people match, so the fourth row is the first record.
		for (let i = 0; i < 3; i++) await fireEvent.keyDown(input, { key: 'ArrowDown' });
		expect(active()).toBe(ids[3]);
		expect(options()[3].closest('[role="group"]')).not.toBe(options()[0].closest('[role="group"]'));
		for (let i = 0; i < 4; i++) await fireEvent.keyDown(input, { key: 'ArrowUp' });
		expect(active()).toBe(ids.at(-1));
		expect(options().filter((o) => o.getAttribute('aria-selected') === 'true')).toHaveLength(1);
	});

	it('follows the active row on Enter, and closes', async () => {
		const onselect = vi.fn();
		const input = await openWith('hopper', { onselect });
		await screen.findByRole('listbox');
		await fireEvent.keyDown(input, { key: 'Enter' });
		expect(onselect).toHaveBeenCalledWith(expect.objectContaining({ id: 'p3', group: 'people' }));
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(screen.getByTestId('state').textContent).toBe('closed:hopper');
	});

	it('opens a new tab on ⌘Enter and Ctrl+Enter, and stays open', async () => {
		const opened = vi.spyOn(window, 'open').mockReturnValue(null);
		const input = await openWith('lovelace');
		await screen.findByRole('listbox');
		await fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
		expect(opened).toHaveBeenCalledWith('#people/lovelace', '_blank', 'noopener');
		expect(screen.getByRole('dialog')).toBeTruthy();
		opened.mockRestore();
	});

	it('marks the match in each title, and leads with an icon or a dot', async () => {
		await openWith('ADA');
		await screen.findByRole('listbox');
		const row = screen.getByRole('option', { name: /Lovelace/ });
		expect(row.querySelector('mark')?.textContent).toBe('Ada');
		expect(row.querySelector<HTMLElement>('.dot')?.style.background).toBe('var(--ds-success)');
		expect(row.querySelector('.meta')?.textContent).toBe('Analysis');
	});

	it('shows the empty snippet before a query, and a line when nothing matches', async () => {
		render(SearchHarness);
		await fireEvent.click(screen.getByRole('button', { name: 'Open search' }));
		const dialog = screen.getByRole('dialog');
		expect(within(dialog).getByRole('link', { name: 'Getting started' })).toBeTruthy();
		const input = screen.getByRole('combobox');
		expect(input.getAttribute('aria-expanded')).toBe('false');
		await fireEvent.input(input, { target: { value: 'zzz' } });
		expect(await screen.findByText('No results for "zzz"', { selector: '.note' })).toBeTruthy();
		expect(input.getAttribute('aria-expanded')).toBe('false');
		expect(input.hasAttribute('aria-activedescendant')).toBe(false);
	});

	it('closes when a plain click follows a link inside it', async () => {
		render(SearchHarness);
		await fireEvent.click(screen.getByRole('button', { name: 'Open search' }));
		await fireEvent.click(screen.getByRole('link', { name: 'Getting started' }), { ctrlKey: true });
		expect(screen.getByRole('dialog')).toBeTruthy();
		await fireEvent.click(screen.getByRole('link', { name: 'Getting started' }));
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('aborts a stale search when the query changes', async () => {
		const signals: AbortSignal[] = [];
		const search = vi.fn((_q: string, signal: AbortSignal) => {
			signals.push(signal);
			return new Promise<SearchGroup[]>(() => {});
		});
		const input = await openWith('a', { search });
		await waitFor(() => expect(search).toHaveBeenCalledTimes(1));
		await fireEvent.input(input, { target: { value: 'ab' } });
		await waitFor(() => expect(search).toHaveBeenCalledTimes(2));
		expect(search.mock.calls.map((c) => c[0])).toEqual(['a', 'ab']);
		expect(signals[0].aborted).toBe(true);
		expect(signals[1].aborted).toBe(false);
	});

	it('waits for typing to pause, and says "Searching…" only after 300ms', async () => {
		vi.useFakeTimers();
		let resolve: (groups: SearchGroup[]) => void = () => {};
		const search = vi.fn(() => new Promise<SearchGroup[]>((r) => (resolve = r)));
		const input = await openWith('rec', { search, debounce: 120 });
		await vi.advanceTimersByTimeAsync(100);
		expect(search).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(40);
		expect(search).toHaveBeenCalledWith('rec', expect.any(AbortSignal));
		await vi.advanceTimersByTimeAsync(200);
		const searching = () => screen.queryByText('Searching…', { selector: '.note' });
		expect(searching()).toBeNull();
		await vi.advanceTimersByTimeAsync(150);
		expect(searching()).toBeTruthy();
		resolve([
			{ id: 'records', label: 'Records', items: [{ id: 'r', title: 'Record', href: '#r' }] }
		]);
		await vi.advanceTimersByTimeAsync(0);
		expect(searching()).toBeNull();
		expect(screen.getAllByRole('option')).toHaveLength(1);
		expect(input.getAttribute('aria-expanded')).toBe('true');
	});

	it('says when a search fails', async () => {
		const search = () => Promise.reject(new Error('offline'));
		await openWith('a', { search });
		expect(await screen.findByText('Search failed. Try again.', { selector: '.note' })).toBeTruthy();
	});
});

describe('searchShortcut', () => {
	const press = (init: KeyboardEventInit, target: EventTarget = document.body) => {
		const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
		target.dispatchEvent(event);
		return event;
	};

	it('opens on /, ⌘K and Ctrl+K, and takes the press', () => {
		const open = vi.fn();
		const stop = searchShortcut(open);
		expect(press({ key: '/' }).defaultPrevented).toBe(true);
		press({ key: 'k', metaKey: true });
		press({ key: 'k', ctrlKey: true });
		press({ key: 'k' });
		expect(open).toHaveBeenCalledTimes(3);
		stop();
		press({ key: '/' });
		expect(open).toHaveBeenCalledTimes(3);
	});

	it('stands aside while typing, and for a press already handled', () => {
		const open = vi.fn();
		const stop = searchShortcut(open, ['/']);
		const field = document.createElement('input');
		document.body.append(field);
		expect(press({ key: '/' }, field).defaultPrevented).toBe(false);
		const handled = new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true });
		handled.preventDefault();
		document.body.dispatchEvent(handled);
		expect(open).not.toHaveBeenCalled();
		field.remove();
		stop();
	});
});
