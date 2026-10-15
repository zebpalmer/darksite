import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import LightboxHarness from '../../tests/LightboxHarness.svelte';

const viewer = () => screen.getByRole('dialog', { name: 'Image viewer' });
const shown = () => screen.getByTestId('index').textContent;

async function openAt(index = 0, loop = false) {
	render(LightboxHarness, { index, loop });
	const trigger = screen.getByRole('button', { name: 'Open viewer' });
	trigger.focus();
	await fireEvent.click(trigger);
	await tick();
	await tick();
	return trigger;
}

describe('Lightbox', () => {
	it('is a named modal dialog that mounts only while open', async () => {
		render(LightboxHarness);
		expect(screen.queryByRole('dialog')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: 'Open viewer' }));
		expect(viewer().getAttribute('aria-modal')).toBe('true');
		expect(screen.getByRole('img', { name: 'Sample 1' })).toBeTruthy();
	});

	it('takes focus, and returns it to the trigger on Esc', async () => {
		const trigger = await openAt();
		expect(document.activeElement).toBe(viewer());
		await fireEvent(viewer(), new Event('cancel', { cancelable: true }));
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('closes from its Close button', async () => {
		await openAt();
		await fireEvent.click(screen.getByRole('button', { name: 'Close' }));
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('steps with the arrow keys and announces the position', async () => {
		await openAt(2);
		const counter = viewer().querySelector('[aria-live="polite"]')!;
		expect(counter.textContent?.trim()).toBe('3 of 12');
		await fireEvent.keyDown(viewer(), { key: 'ArrowRight' });
		expect(shown()).toBe('3');
		expect(counter.textContent?.trim()).toBe('4 of 12');
		expect(screen.getByRole('img', { name: 'Sample 4' })).toBeTruthy();
		await fireEvent.keyDown(viewer(), { key: 'ArrowLeft' });
		await fireEvent.keyDown(viewer(), { key: 'ArrowLeft' });
		expect(shown()).toBe('1');
		await fireEvent.keyDown(viewer(), { key: 'End' });
		expect(shown()).toBe('11');
		await fireEvent.keyDown(viewer(), { key: 'Home' });
		expect(shown()).toBe('0');
	});

	it('stops at the ends, and disables the button that would pass them', async () => {
		await openAt(0);
		expect(screen.getByRole('button', { name: 'Previous image' }).hasAttribute('disabled')).toBe(true);
		await fireEvent.keyDown(viewer(), { key: 'ArrowLeft' });
		expect(shown()).toBe('0');
		await fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
		expect(shown()).toBe('1');
	});

	it('wraps around with loop', async () => {
		await openAt(0, true);
		await fireEvent.keyDown(viewer(), { key: 'ArrowLeft' });
		expect(shown()).toBe('11');
		await fireEvent.keyDown(viewer(), { key: 'ArrowRight' });
		expect(shown()).toBe('0');
	});

	it('names its shortcuts on the buttons they drive', async () => {
		await openAt(1);
		expect(screen.getByRole('button', { name: 'Next image' }).getAttribute('aria-keyshortcuts')).toBe(
			'arrowright'
		);
		expect(screen.getByRole('button', { name: 'Close' }).getAttribute('aria-keyshortcuts')).toBe(
			'escape'
		);
	});

	it('zooms with + and −, and resets with 0', async () => {
		await openAt();
		const zoomOut = screen.getByRole('button', { name: 'Zoom out' });
		expect(zoomOut.hasAttribute('disabled')).toBe(true);
		await fireEvent.keyDown(viewer(), { key: '+' });
		const img = screen.getByRole('img', { name: 'Sample 1' });
		expect(img.style.transform).toContain('scale(1.5)');
		expect(zoomOut.hasAttribute('disabled')).toBe(false);
		await fireEvent.keyDown(viewer(), { key: '0' });
		expect(img.style.transform).toContain('scale(1)');
	});

	it('ignores page keys while typing in a toolbar field', async () => {
		await openAt(4);
		const input = document.createElement('input');
		viewer().appendChild(input);
		await fireEvent.keyDown(input, { key: 'ArrowRight' });
		expect(shown()).toBe('4');
	});

	it('renders the caption and actions snippets', async () => {
		await openAt(1);
		expect(viewer().textContent).toContain('Caption for Sample 2');
		expect(screen.getByRole('button', { name: 'Download' })).toBeTruthy();
	});
});
