import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import FileInput from './FileInput.svelte';

function choose(input: HTMLInputElement, files: File[]) {
	Object.defineProperty(input, 'files', { value: files, configurable: true });
	return fireEvent.change(input);
}

const native = (container: HTMLElement) =>
	container.querySelector('input[type="file"]') as HTMLInputElement;

describe('FileInput', () => {
	it('keeps the native file input as the control, with the visible button for the pointer', () => {
		const { container } = render(FileInput, {
			id: 'upload',
			accept: '.csv',
			name: 'import',
			'aria-describedby': 'upload-note'
		});
		const input = native(container);
		expect(input.id).toBe('upload');
		expect(input.accept).toBe('.csv');
		expect(input.name).toBe('import');
		expect(input.getAttribute('aria-describedby')).toBe('upload-note');
		expect(input.tabIndex).toBe(0);
		const pick = container.querySelector('.pick') as HTMLButtonElement;
		expect(pick.tabIndex).toBe(-1);
		expect(pick.getAttribute('aria-hidden')).toBe('true');
		expect(pick.textContent?.trim()).toBe('Choose file');
		expect(screen.getByText('No file chosen')).toBeTruthy();
	});

	it('opens the picker from the visible button', async () => {
		const { container } = render(FileInput);
		const input = native(container);
		const click = vi.spyOn(input, 'click').mockImplementation(() => {});
		await fireEvent.click(container.querySelector('.pick')!);
		expect(click).toHaveBeenCalledTimes(1);
		expect(document.activeElement).toBe(input);
	});

	it('shows the chosen file name, reports it, and clears it', async () => {
		const onfiles = vi.fn();
		const { container } = render(FileInput, { onfiles });
		const file = new File(['a,b'], 'records-2026.csv', { type: 'text/csv' });
		await choose(native(container), [file]);
		expect(onfiles).toHaveBeenLastCalledWith([file]);
		const name = screen.getByText('records-2026.csv');
		expect(name.getAttribute('title')).toBe('records-2026.csv');
		await fireEvent.click(screen.getByRole('button', { name: 'Clear file' }));
		expect(onfiles).toHaveBeenLastCalledWith([]);
		expect(screen.getByText('No file chosen')).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Clear file' })).toBeNull();
	});

	it('counts several files and lists them in the tooltip', async () => {
		const { container } = render(FileInput, { multiple: true });
		expect(native(container).multiple).toBe(true);
		expect(container.querySelector('.pick')?.textContent?.trim()).toBe('Choose files');
		await choose(native(container), [new File([''], 'a.txt'), new File([''], 'b.txt')]);
		expect(screen.getByText('2 files').getAttribute('title')).toBe('a.txt\nb.txt');
	});

	it('is invalid and disabled on request', () => {
		const { container } = render(FileInput, { invalid: true, disabled: true });
		const input = native(container);
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.disabled).toBe(true);
		expect((container.querySelector('.pick') as HTMLButtonElement).disabled).toBe(true);
	});
});
