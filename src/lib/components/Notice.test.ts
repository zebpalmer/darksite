import { describe, expect, it, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Notice from './Notice.svelte';
import { dismissalKey, rememberDismissal, wasDismissed } from '../dismissal.js';

describe('Notice', () => {
	it('is a status with its tone, title and message', () => {
		const { container } = render(Notice, {
			tone: 'success',
			title: 'Import finished',
			message: '412 records were added.'
		});
		const notice = screen.getByRole('status');
		expect(notice.dataset.tone).toBe('success');
		expect(notice.textContent).toContain('Import finished');
		expect(notice.textContent).toContain('412 records were added.');
		expect(container.querySelector('.icon svg')).toBeTruthy();
	});

	it('is an alert for danger, and a danger notice cannot be dismissed', () => {
		render(Notice, { id: 'x', tone: 'danger', message: 'The import failed.', dismissible: true });
		expect(screen.getByRole('alert')).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
	});

	it('renders one action', () => {
		const action = createRawSnippet(() => ({ render: () => '<a href="/help">Read more</a>' }));
		render(Notice, { message: 'Figures are provisional.', action });
		expect(screen.getByRole('link', { name: 'Read more' })).toBeTruthy();
	});

	it('remembers a dismissal with the shared dismissal logic', async () => {
		localStorage.clear();
		const ondismiss = vi.fn();
		const { unmount } = render(Notice, {
			id: 'provisional',
			viewer: 'u1',
			message: 'Figures are provisional.',
			dismissible: true,
			ondismiss
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
		expect(screen.queryByRole('status')).toBeNull();
		expect(ondismiss).toHaveBeenCalledTimes(1);
		expect(wasDismissed(dismissalKey('notice', 'provisional', 'u1'))).toBe(true);
		unmount();
		render(Notice, { id: 'provisional', viewer: 'u1', message: 'Figures.', dismissible: true });
		await vi.waitFor(() => expect(screen.queryByRole('status')).toBeNull());
	});

	it('dismisses for this page view only with remember={false}', async () => {
		localStorage.clear();
		const { unmount } = render(Notice, {
			id: 'once',
			message: 'A note.',
			dismissible: true,
			remember: false
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
		unmount();
		render(Notice, { id: 'once', message: 'A note.', dismissible: true, remember: false });
		expect(screen.getByRole('status')).toBeTruthy();
	});

	it('starts hidden when the server already knows it was dismissed', () => {
		render(Notice, { id: 'x', message: 'A note.', dismissible: true, dismissed: true });
		expect(screen.queryByRole('status')).toBeNull();
	});
});

describe('dismissal', () => {
	it('keys by kind, viewer and id, and survives storage that throws', () => {
		localStorage.clear();
		expect(dismissalKey('banner', 'sync')).toBe('darksite:banner:sync');
		expect(dismissalKey('notice', 'sync', 'u1')).toBe('darksite:notice:u1:sync');
		rememberDismissal('darksite:notice:a');
		expect(wasDismissed('darksite:notice:a')).toBe(true);
		const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		expect(wasDismissed('darksite:notice:a')).toBe(false);
		expect(() => rememberDismissal('darksite:notice:b')).not.toThrow();
		get.mockRestore();
		set.mockRestore();
	});
});
