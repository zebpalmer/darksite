import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Stepper from './Stepper.svelte';

describe('Stepper', () => {
	it('is a named spinbutton carrying its value and bounds', () => {
		render(Stepper, { value: 4, min: 0, max: 10, label: 'Copies' });
		const field = screen.getByRole('spinbutton', { name: 'Copies' }) as HTMLInputElement;
		expect(field.value).toBe('4');
		expect(field.getAttribute('aria-valuenow')).toBe('4');
		expect(field.getAttribute('aria-valuemin')).toBe('0');
		expect(field.getAttribute('aria-valuemax')).toBe('10');
	});

	it('steps with the arrows and pages, and jumps to the bounds', async () => {
		const onchange = vi.fn();
		render(Stepper, { value: 4, min: 0, max: 50, label: 'Copies', onchange });
		const field = screen.getByRole('spinbutton');
		await fireEvent.keyDown(field, { key: 'ArrowUp' });
		expect(onchange).toHaveBeenLastCalledWith(5);
		await fireEvent.keyDown(field, { key: 'PageUp' });
		expect(onchange).toHaveBeenLastCalledWith(15);
		await fireEvent.keyDown(field, { key: 'ArrowDown' });
		expect(onchange).toHaveBeenLastCalledWith(14);
		await fireEvent.keyDown(field, { key: 'End' });
		expect(onchange).toHaveBeenLastCalledWith(50);
		await fireEvent.keyDown(field, { key: 'Home' });
		expect(onchange).toHaveBeenLastCalledWith(0);
		await fireEvent.keyDown(field, { key: 'PageDown' });
		expect(onchange).toHaveBeenCalledTimes(5);
	});

	it('steps with the buttons, which leave the tab order and disable at a bound', async () => {
		const onchange = vi.fn();
		render(Stepper, { value: 1, min: 0, max: 2, label: 'Copies', onchange });
		const down = screen.getByRole('button', { name: 'Decrease' }) as HTMLButtonElement;
		const up = screen.getByRole('button', { name: 'Increase' }) as HTMLButtonElement;
		expect(down.tabIndex).toBe(-1);
		await fireEvent.click(up);
		expect(onchange).toHaveBeenLastCalledWith(2);
		expect(up.disabled).toBe(true);
		await fireEvent.click(down);
		await fireEvent.click(down);
		expect(onchange).toHaveBeenLastCalledWith(0);
		expect(down.disabled).toBe(true);
	});

	it('clamps and snaps a typed value when committed, and reverts nonsense', async () => {
		const onchange = vi.fn();
		render(Stepper, { value: 0.5, min: 0, max: 2, step: 0.25, label: 'Weight', onchange });
		const field = screen.getByRole('spinbutton') as HTMLInputElement;
		await fireEvent.input(field, { target: { value: '1.3' } });
		await fireEvent.keyDown(field, { key: 'Enter' });
		expect(onchange).toHaveBeenLastCalledWith(1.25);
		await fireEvent.input(field, { target: { value: '9' } });
		await fireEvent.blur(field);
		expect(onchange).toHaveBeenLastCalledWith(2);
		await fireEvent.input(field, { target: { value: 'abc' } });
		await fireEvent.blur(field);
		expect(field.value).toBe('2');
		expect(onchange).toHaveBeenCalledTimes(2);
	});

	it('can be disabled', () => {
		render(Stepper, { value: 1, label: 'Copies', disabled: true });
		expect((screen.getByRole('spinbutton') as HTMLInputElement).disabled).toBe(true);
	});
});

describe('Stepper with a typed draft', () => {
	it('steps from the typed value, not the one before it', async () => {
		const onchange = vi.fn();
		render(Stepper, { value: 0, min: 0, max: 500, label: 'Copies', onchange });
		const field = screen.getByRole('spinbutton') as HTMLInputElement;
		await fireEvent.input(field, { target: { value: '50' } });
		await fireEvent.keyDown(field, { key: 'ArrowUp' });
		expect(onchange).toHaveBeenLastCalledWith(51);
		await fireEvent.input(field, { target: { value: '200' } });
		await fireEvent.keyDown(field, { key: 'PageDown' });
		expect(onchange.mock.lastCall?.[0]).toBeLessThan(200);
	});
});
