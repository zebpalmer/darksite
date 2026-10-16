import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import CodeBlock from './CodeBlock.svelte';
import CopyButton from './CopyButton.svelte';

const live = (container: HTMLElement) =>
	container.querySelector('[aria-live="polite"]') as HTMLElement;

function stubClipboard(writeText?: (text: string) => Promise<void>) {
	Object.defineProperty(navigator, 'clipboard', {
		configurable: true,
		value: writeText ? { writeText } : undefined
	});
}

function stubExecCommand(result: boolean | 'throw') {
	const exec = vi.fn(() => {
		if (result === 'throw') throw new Error('unsupported');
		return result;
	});
	Object.defineProperty(document, 'execCommand', { configurable: true, value: exec });
	return exec;
}

afterEach(() => {
	stubClipboard();
	vi.useRealTimers();
});

describe('CopyButton', () => {
	it('copies with the Clipboard API, says "Copied" and announces it', async () => {
		const writeText = vi.fn(() => Promise.resolve());
		stubClipboard(writeText);
		const oncopy = vi.fn();
		const { container } = render(CopyButton, { value: 'R-00412', oncopy });
		expect(live(container).textContent).toBe('');
		await fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
		await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy());
		expect(writeText).toHaveBeenCalledWith('R-00412');
		expect(oncopy).toHaveBeenCalledWith(true);
		expect(live(container).textContent).toBe('Copied');
	});

	it('reads a function value at the moment of copying', async () => {
		const writeText = vi.fn(() => Promise.resolve());
		stubClipboard(writeText);
		let value = 'first';
		render(CopyButton, { value: () => value });
		value = 'second';
		await fireEvent.click(screen.getByRole('button'));
		await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('second'));
	});

	it('falls back to a selected field without the Clipboard API', async () => {
		stubClipboard();
		const exec = stubExecCommand(true);
		const { container } = render(CopyButton, { value: 'abc' });
		await fireEvent.click(screen.getByRole('button'));
		await vi.waitFor(() => expect(live(container).textContent).toBe('Copied'));
		expect(exec).toHaveBeenCalledWith('copy');
		expect(document.querySelector('textarea')).toBeNull();
	});

	it('falls back when the Clipboard API refuses', async () => {
		stubClipboard(() => Promise.reject(new Error('denied')));
		stubExecCommand(true);
		const oncopy = vi.fn();
		render(CopyButton, { value: 'abc', oncopy });
		await fireEvent.click(screen.getByRole('button'));
		await vi.waitFor(() => expect(oncopy).toHaveBeenCalledWith(true));
	});

	it('says "Copy failed" when nothing can copy, and never throws', async () => {
		stubClipboard();
		stubExecCommand('throw');
		const { container } = render(CopyButton, { value: 'abc' });
		await fireEvent.click(screen.getByRole('button'));
		await vi.waitFor(() => expect(live(container).textContent).toBe('Copy failed'));
		expect(screen.getByRole('button', { name: 'Copy failed' })).toBeTruthy();
	});

	it('returns to its label after resetAfter', async () => {
		stubClipboard(() => Promise.resolve());
		render(CopyButton, { value: 'abc', resetAfter: 20 });
		await fireEvent.click(screen.getByRole('button'));
		await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy());
		await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy());
	});

	it('has an inline icon form named by its label', async () => {
		stubClipboard(() => Promise.resolve());
		const { container } = render(CopyButton, { value: 'abc', inline: true, label: 'Copy serial' });
		const button = screen.getByRole('button', { name: 'Copy serial' });
		expect(button.classList.contains('inline')).toBe(true);
		expect(button.textContent?.trim()).toBe('');
		await fireEvent.click(button);
		await vi.waitFor(() => expect(button.getAttribute('aria-label')).toBe('Copied'));
		expect(container.querySelector('.ds-copy')?.getAttribute('data-result')).toBe('copied');
	});
});

describe('CodeBlock', () => {
	const code = 'npm install --save-dev example-package';

	it('is a focusable, named scroller holding the code, with a copy button', async () => {
		const writeText = vi.fn(() => Promise.resolve());
		stubClipboard(writeText);
		render(CodeBlock, { code, label: 'Shell' });
		const region = screen.getByRole('region', { name: 'Shell' });
		expect(region.tagName).toBe('PRE');
		expect(region.getAttribute('tabindex')).toBe('0');
		expect(region.textContent).toBe(code);
		expect(screen.getByText('Shell').tagName).toBe('FIGCAPTION');
		await fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
		expect(writeText).toHaveBeenCalledWith(code);
	});

	it('is named "Code" without a label, and can leave out the copy button', () => {
		render(CodeBlock, { code, copy: false });
		expect(screen.getByRole('region', { name: 'Code' })).toBeTruthy();
		expect(screen.queryByRole('button')).toBeNull();
	});
});
