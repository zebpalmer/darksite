import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ErrorPage, { errorCopy } from './ErrorPage.svelte';

describe('ErrorPage', () => {
	it('titles the page from the status with neutral copy', () => {
		render(ErrorPage, { status: 404, homeHref: '/' });
		const heading = screen.getByRole('heading', { level: 1, name: 'Page not found' });
		expect(screen.getByRole('region', { name: 'Page not found' })).toBeTruthy();
		expect(heading).toBeTruthy();
		expect(screen.getByText('404')).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Go home' }).getAttribute('href')).toBe('/');
		expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
	});

	it('retries, and takes its own title, message and detail', async () => {
		const onretry = vi.fn();
		render(ErrorPage, {
			status: 500,
			title: 'Report failed to load',
			message: 'The report could not be built. Try again.',
			detail: 'Reference R-00412',
			onretry
		});
		expect(screen.getByRole('heading', { name: 'Report failed to load' })).toBeTruthy();
		expect(screen.getByText('Reference R-00412')).toBeTruthy();
		await fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
		expect(onretry).toHaveBeenCalledTimes(1);
	});

	it('shows no code for offline', () => {
		render(ErrorPage, { status: 0 });
		expect(screen.getByRole('heading', { name: 'Offline' })).toBeTruthy();
		expect(screen.queryByText('0')).toBeNull();
	});

	it('has neutral copy for every common status', () => {
		for (const status of [0, 400, 401, 403, 404, 408, 429, 500, 503, 504, null]) {
			const copy = errorCopy(status);
			expect(copy.title).toMatch(/^[A-Z][^!]*$/);
			expect(copy.message).not.toMatch(/oops|sorry|!/i);
		}
	});
});
