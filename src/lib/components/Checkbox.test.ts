import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Checkbox from './Checkbox.svelte';
import Radio from './Radio.svelte';
import Switch from './Switch.svelte';

describe('Checkbox', () => {
	it('is a labeled native checkbox that reports changes', async () => {
		const onchange = vi.fn();
		render(Checkbox, { label: 'Archived', onchange });
		const box = screen.getByRole('checkbox', { name: 'Archived' }) as HTMLInputElement;
		await fireEvent.click(box);
		expect(box.checked).toBe(true);
		expect(onchange).toHaveBeenCalledWith(true, expect.anything());
	});

	it('shows the mixed state natively and to assistive technology', () => {
		render(Checkbox, { label: 'Select all rows', checked: 'mixed', hideLabel: true });
		const box = screen.getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement;
		expect(box.indeterminate).toBe(true);
		expect(box.getAttribute('aria-checked')).toBe('mixed');
	});

	it('marks an invalid box', () => {
		render(Checkbox, { label: 'Accept terms', invalid: true });
		expect(screen.getByRole('checkbox').getAttribute('aria-invalid')).toBe('true');
	});
});

describe('Radio', () => {
	it('is checked when the group holds its value, and reports a pick', async () => {
		const onchange = vi.fn();
		render(Radio, { name: 'scope', value: 'mine', group: 'all', label: 'Mine', onchange });
		const radio = screen.getByRole('radio', { name: 'Mine' }) as HTMLInputElement;
		expect(radio.checked).toBe(false);
		await fireEvent.click(radio);
		expect(onchange).toHaveBeenCalledWith('mine');
	});
});

describe('Switch', () => {
	it('is a switch whose state is written as well as drawn', async () => {
		const onchange = vi.fn();
		const { container } = render(Switch, { label: 'Email alerts', onchange });
		const control = screen.getByRole('switch', { name: 'Email alerts' });
		expect(control.getAttribute('aria-checked')).toBe('false');
		expect(container.textContent).toContain('Off');
		await fireEvent.click(control);
		expect(onchange).toHaveBeenCalledWith(true);
		expect(control.getAttribute('aria-checked')).toBe('true');
		expect(container.textContent).toContain('On');
	});
});
