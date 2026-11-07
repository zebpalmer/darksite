import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ConnectionStatus from './ConnectionStatus.svelte';

const status = () => screen.getByRole('status');

describe('ConnectionStatus', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('renders nothing visible while connected and sent', () => {
		const { container } = render(ConnectionStatus, { online: true });
		expect(container.querySelector('.line')).toBeNull();
		expect(screen.queryByRole('button')).toBeNull();
		expect(status().textContent).toBe('');
	});

	it('says offline, with what is waiting, and announces it', () => {
		const { container } = render(ConnectionStatus, { online: false, queued: 3 });
		const line = container.querySelector<HTMLElement>('.line')!;
		expect(line.dataset.state).toBe('offline');
		expect(line.textContent).toContain('Offline');
		expect(line.textContent).toContain('3 waiting');
		expect(line.getAttribute('aria-hidden')).toBe('true');
		expect(status().textContent).toBe('Offline, 3 changes waiting to sync');
	});

	it('shows the worst state: refused changes over offline over reconnecting', async () => {
		const { container, rerender } = render(ConnectionStatus, { online: true, reconnecting: true, queued: 1 });
		expect(container.querySelector<HTMLElement>('.line')!.dataset.state).toBe('reconnecting');
		await rerender({ online: false, reconnecting: true, queued: 1 });
		expect(container.querySelector<HTMLElement>('.line')!.dataset.state).toBe('offline');
		await rerender({ online: false, queued: 1, failed: [{ id: 'a', label: 'Note on R412' }] });
		expect(container.querySelector('.line')).toBeNull();
		expect(screen.getByRole('button', { name: '1 not saved' })).toBeTruthy();
	});

	it('lists refused changes with their reasons, and dismisses or retries them', async () => {
		const ondismiss = vi.fn();
		const onretry = vi.fn();
		render(ConnectionStatus, {
			online: true,
			failed: [
				{ id: 'a', label: 'Move R412', reason: 'Already moved' },
				{ id: 'b', label: 'Note on R413' }
			],
			ondismiss,
			onretry
		});
		await fireEvent.click(screen.getByRole('button', { name: '2 not saved' }));
		const panel = screen.getByRole('dialog', { name: 'Not saved' });
		expect(panel.textContent).toContain('Already moved');
		await fireEvent.click(screen.getByRole('button', { name: 'Dismiss Move R412' }));
		expect(ondismiss).toHaveBeenCalledWith('a');
		await fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
		expect(onretry).toHaveBeenCalledOnce();
	});

	it("follows the browser's own online state when the app passes none", async () => {
		vi.stubGlobal('navigator', { ...navigator, onLine: false });
		const { container } = render(ConnectionStatus);
		await Promise.resolve();
		expect(container.querySelector<HTMLElement>('.line')?.dataset.state).toBe('offline');
		vi.stubGlobal('navigator', { ...navigator, onLine: true });
		await fireEvent(window, new Event('online'));
		expect(container.querySelector('.line')).toBeNull();
	});

	it('draws the icon alone when compact, with its words in the tooltip handlers', async () => {
		const tip = vi.fn((label: string) => ({
			onmouseenter: () => {},
			onmouseleave: () => {},
			onfocus: () => {},
			onblur: () => {}
		}));
		const { container, rerender } = render(ConnectionStatus, { online: false, queued: 2, compact: true, tip });
		const line = container.querySelector<HTMLElement>('.line')!;
		expect(line.textContent?.trim()).toBe('');
		expect(tip).toHaveBeenCalledWith('Offline · 2 waiting');
		expect(status().textContent).toBe('Offline, 2 changes waiting to sync');
		await rerender({ online: true, compact: true, tip, failed: [{ id: 'a', label: 'Move R-00412' }] });
		const button = screen.getByRole('button', { name: '1 not saved' });
		expect(button.textContent?.trim()).toBe('');
	});
});
