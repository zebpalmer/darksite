import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import LoadMore from './LoadMore.svelte';
import Select from './Select.svelte';
import Textarea from './Textarea.svelte';

describe('LoadMore', () => {
	it('says how many are shown and loads more', async () => {
		const onLoadMore = vi.fn();
		render(LoadMore, { shown: 50, total: 295, onLoadMore });
		expect(screen.getByText('Showing 50 of 295')).toBeTruthy();
		await fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
		expect(onLoadMore).toHaveBeenCalledTimes(1);
	});

	it('hides the button when everything is shown', () => {
		render(LoadMore, { shown: 295, total: 295, onLoadMore: () => {} });
		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.getByText('Showing 295 of 295')).toBeTruthy();
	});

	it('moves focus to the first new row after a keyboard press, not a click', async () => {
		const focusRow = vi.fn();
		let resolve = () => {};
		const onLoadMore = () => new Promise<void>((r) => (resolve = r));
		const { rerender } = render(LoadMore, { shown: 50, total: 295, onLoadMore, focusRow });
		const button = screen.getByRole('button', { name: 'Load more' });
		await fireEvent.keyDown(button, { key: 'Enter' });
		await fireEvent.click(button);
		resolve();
		await rerender({ shown: 100, total: 295, onLoadMore, focusRow });
		await vi.waitFor(() => expect(focusRow).toHaveBeenCalledWith(50));
	});
});

describe('Textarea', () => {
	it('takes the Field contract', () => {
		render(Textarea, { id: 'n', describedBy: 'n-help', invalid: true, value: 'Note' });
		const box = screen.getByRole('textbox') as HTMLTextAreaElement;
		expect(box.id).toBe('n');
		expect(box.getAttribute('aria-describedby')).toBe('n-help');
		expect(box.getAttribute('aria-invalid')).toBe('true');
		expect(box.value).toBe('Note');
	});
});

describe('Select', () => {
	it('is a native select with a prompt, options and groups', async () => {
		const options = [{ value: 'a', label: 'Open' }];
		const groups = [{ label: 'Closed', options: [{ value: 'b', label: 'Done' }] }];
		render(Select, { options, groups, 'aria-label': 'Status' });
		const select = screen.getByRole('combobox', { name: 'Status' }) as HTMLSelectElement;
		expect(select.options[0].textContent).toBe('Choose…');
		expect(select.options[0].disabled).toBe(true);
		expect(select.querySelector('optgroup')?.getAttribute('label')).toBe('Closed');
		await fireEvent.change(select, { target: { value: 'b' } });
		expect(select.value).toBe('b');
	});
});
