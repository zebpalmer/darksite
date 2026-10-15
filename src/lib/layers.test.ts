import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { modals, trackModal } from './layers.svelte.js';
import { ToastStore } from './toast.svelte.js';
import ModalHarness from '../tests/ModalHarness.svelte';
import TopmostHarness from '../tests/TopmostHarness.svelte';

function modal() {
	const el = document.createElement('dialog');
	document.body.append(el);
	return el;
}

describe('modal stack', () => {
	afterEach(() => document.body.replaceChildren());

	it('counts open modals and knows the topmost', () => {
		const a = modal();
		const b = modal();
		const offA = trackModal(a);
		const offB = trackModal(b);
		expect([modals.open, modals.count, modals.top]).toEqual([true, 2, b]);
		offB();
		expect([modals.count, modals.top]).toEqual([1, a]);
		offA();
		expect([modals.open, modals.count, modals.top]).toEqual([false, 0, null]);
	});

	it('is dirty while any open modal says so', () => {
		let edited = false;
		const off = trackModal(modal(), { dirty: () => edited });
		const offClean = trackModal(modal());
		expect(modals.dirty).toBe(false);
		edited = true;
		expect(modals.dirty).toBe(true);
		off();
		expect(modals.dirty).toBe(false);
		offClean();
	});
});

describe('topmost', () => {
	it('moves an element into the open modal and back', () => {
		const { container } = render(TopmostHarness);
		const notice = container.querySelector('.notice')!;
		const home = container.querySelector('.home')!;
		const dialog = modal();
		const off = trackModal(dialog);
		flushSync();
		expect(notice.parentElement).toBe(dialog);
		off();
		flushSync();
		expect(notice.parentElement).toBe(home);
		dialog.remove();
	});

	it('comes back when the modal is removed with the element inside it', () => {
		const { container } = render(TopmostHarness);
		const notice = container.querySelector('.notice')!;
		const dialog = modal();
		const off = trackModal(dialog);
		flushSync();
		dialog.remove();
		off();
		flushSync();
		expect(notice.parentElement).toBe(container.querySelector('.home'));
	});

	it('leaves the modal when its owner unmounts it', async () => {
		const { container, rerender } = render(TopmostHarness);
		const dialog = modal();
		const off = trackModal(dialog);
		flushSync();
		expect(dialog.querySelector('.notice')).not.toBeNull();
		await rerender({ show: false });
		expect(dialog.querySelector('.notice')).toBeNull();
		expect(container.querySelector('.notice')).toBeNull();
		expect(container.innerHTML).not.toContain('ds-topmost');
		off();
		dialog.remove();
	});
});

describe('Dialog and Sheet on the stack', () => {
	it('carries the Toaster into the topmost modal and back', async () => {
		const store = new ToastStore();
		const { container, rerender } = render(ModalHarness, { store });
		const queue = screen.getByRole('list', { name: 'Notifications' });
		const home = container.querySelector('.ds-toaster-home');
		expect(queue.parentElement).toBe(home);

		await rerender({ store, sheet: true });
		const sheet = container.querySelector('dialog.ds-sheet');
		expect(modals.count).toBe(1);
		expect(queue.parentElement).toBe(sheet);

		await rerender({ store, sheet: true, dialog: true });
		expect(modals.count).toBe(2);
		expect(queue.parentElement).toBe(container.querySelector('dialog.ds-dialog'));

		await rerender({ store, sheet: true, dialog: false });
		expect(queue.parentElement).toBe(sheet);

		await rerender({ store, sheet: false, dialog: false });
		expect(modals.open).toBe(false);
		expect(queue.parentElement).toBe(home);
	});

	it('keeps toasts usable while the sheet is open', async () => {
		const store = new ToastStore();
		const onAction = vi.fn();
		const { container } = render(ModalHarness, { store, sheet: true });
		store.info('Archived', { action: { label: 'Undo', onAction }, duration: null });
		await vi.waitFor(() => screen.getByRole('button', { name: 'Undo' }));
		const sheet = container.querySelector('dialog.ds-sheet')!;
		expect(sheet.contains(screen.getByRole('button', { name: 'Undo' }))).toBe(true);
		await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
		expect(onAction).toHaveBeenCalledTimes(1);
	});

	it('reports a dirty sheet and lets onbeforeclose keep it open', async () => {
		let allow = false;
		const onbeforeclose = vi.fn(() => allow);
		const { container, rerender } = render(ModalHarness, {
			sheet: true,
			dirty: true,
			onbeforeclose
		});
		expect(modals.dirty).toBe(true);
		await fireEvent.click(screen.getByRole('button', { name: 'Close' }));
		expect(onbeforeclose).toHaveBeenCalledTimes(1);
		expect(container.querySelector('dialog.ds-sheet')).not.toBeNull();
		allow = true;
		await fireEvent.click(screen.getByRole('button', { name: 'Close' }));
		expect(container.querySelector('dialog.ds-sheet')).toBeNull();
		expect(modals.dirty).toBe(false);
		await rerender({ sheet: false, dirty: false });
	});
});
