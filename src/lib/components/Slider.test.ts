import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Slider from './Slider.svelte';

describe('Slider', () => {
	it('is a native range with its bounds, step and name', () => {
		render(Slider, { value: 30, min: 0, max: 60, step: 5, label: 'Window' });
		const range = screen.getByRole('slider', { name: 'Window' }) as HTMLInputElement;
		expect(range.type).toBe('range');
		expect(range.min).toBe('0');
		expect(range.max).toBe('60');
		expect(range.step).toBe('5');
		expect(range.value).toBe('30');
		expect(range.getAttribute('aria-valuetext')).toBe('30');
	});

	it('reports input and change, and binds the value', async () => {
		const oninput = vi.fn();
		const onchange = vi.fn();
		render(Slider, { value: 10, label: 'Level', oninput, onchange });
		const range = screen.getByRole('slider') as HTMLInputElement;
		await fireEvent.input(range, { target: { value: '40' } });
		expect(oninput).toHaveBeenCalledWith(40);
		await fireEvent.change(range, { target: { value: '45' } });
		expect(onchange).toHaveBeenCalledWith(45);
	});

	it('labels ticks under the track and speaks a tick label at its value', () => {
		const { container } = render(Slider, {
			value: 50,
			label: 'Detail',
			ticks: [0, { value: 50, label: 'Normal' }, 100]
		});
		const ticks = [...container.querySelectorAll<HTMLElement>('.tick')];
		expect(ticks.map((t) => t.textContent)).toEqual(['0', 'Normal', '100']);
		expect(ticks.map((t) => t.dataset.edge)).toEqual(['start', undefined, 'end']);
		expect(ticks[1].style.getPropertyValue('--at')).toBe('0.5');
		expect(container.querySelector('.ticks')?.getAttribute('aria-hidden')).toBe('true');
		expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('Normal');
	});

	it('shows the formatted value and takes a Field’s wiring', () => {
		render(Slider, {
			value: 0.25,
			min: 0,
			max: 1,
			step: 0.05,
			showValue: true,
			format: (v: number) => `${Math.round(v * 100)}%`,
			id: 'f-1',
			describedBy: 'f-note',
			invalid: true
		});
		const range = screen.getByRole('slider');
		expect(range.id).toBe('f-1');
		expect(range.getAttribute('aria-describedby')).toBe('f-note');
		expect(range.getAttribute('aria-invalid')).toBe('true');
		expect(range.getAttribute('aria-valuetext')).toBe('25%');
		const output = screen.getByRole('status');
		expect(output.tagName).toBe('OUTPUT');
		expect(output.textContent).toBe('25%');
		expect(output.getAttribute('for')).toBe('f-1');
	});

	it('is disabled', () => {
		render(Slider, { label: 'Level', disabled: true });
		expect((screen.getByRole('slider') as HTMLInputElement).disabled).toBe(true);
	});
});
