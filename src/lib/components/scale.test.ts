import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ScaleBadge from './ScaleBadge.svelte';
import ScalePicker from './ScalePicker.svelte';
import { defineScale } from '../scale.js';

const names = ['Remote', 'Unlikely', 'Doubtful', 'Even', 'Probable', 'Likely', 'Very likely', 'Certain'];
const confidence = defineScale({
	name: 'Confidence',
	stops: names.map((label, i) => ({
		value: `c${i + 1}`,
		label,
		mark: `var(--app-c${i + 1})`,
		bg: `var(--app-c${i + 1}-bg)`,
		ink: `var(--app-c${i + 1}-ink)`
	})),
	unknown: { value: 'unknown', label: 'Unknown' }
});

describe('ScaleBadge', () => {
	it('shows the name, with one pip per ordered stop', () => {
		const { container } = render(ScaleBadge, { scale: confidence, value: 'c5', pips: true });
		expect(container.querySelector('.ds-scale')?.textContent).toBe('Probable');
		expect(container.querySelectorAll('.pip')).toHaveLength(8);
		expect(container.querySelectorAll('.pip[data-on]')).toHaveLength(5);
	});

	it('draws unknown with a dashed mark and no lit pips', () => {
		const { container } = render(ScaleBadge, { scale: confidence, value: 'unknown', pips: true, size: 'sm' });
		const badge = container.querySelector('.ds-scale') as HTMLElement;
		expect(badge.textContent).toBe('Unknown');
		expect(badge.dataset.unknown).toBe('');
		expect(badge.dataset.size).toBe('sm');
		expect(container.querySelectorAll('.pip[data-on]')).toHaveLength(0);
	});

	it('renders nothing when unset', () => {
		const { container } = render(ScaleBadge, { scale: confidence, value: null });
		expect(container.querySelector('.ds-scale')).toBeNull();
	});
});

describe('ScalePicker', () => {
	it('is a radio group named for the scale, with unknown after a ceiling', () => {
		render(ScalePicker, { scale: confidence, max: 'c6' });
		expect(screen.getByRole('radiogroup', { name: 'Confidence' })).toBeTruthy();
		const radios = screen.getAllByRole('radio');
		expect(radios.map((r) => r.textContent?.trim())).toEqual([...names.slice(0, 6), 'Unknown']);
		expect(radios.at(-1)?.dataset.unknown).toBe('');
		expect(document.querySelector('.ds-scalepicker')?.getAttribute('data-count')).toBe('7');
	});

	it('roves with arrows, wraps, and jumps with Home and End', async () => {
		const onchange = vi.fn();
		render(ScalePicker, { scale: confidence, value: 'c8', onchange });
		const radios = screen.getAllByRole('radio');
		expect(radios[7].tabIndex).toBe(0);
		expect(radios.filter((r) => r.tabIndex === 0)).toHaveLength(1);
		await fireEvent.keyDown(radios[7], { key: 'ArrowRight' });
		expect(onchange).toHaveBeenLastCalledWith('unknown');
		await fireEvent.keyDown(radios[8], { key: 'ArrowRight' });
		expect(onchange).toHaveBeenLastCalledWith('c1');
		await fireEvent.keyDown(radios[0], { key: 'End' });
		expect(onchange).toHaveBeenLastCalledWith('unknown');
		await fireEvent.keyDown(radios[8], { key: 'Home' });
		expect(onchange).toHaveBeenLastCalledWith('c1');
		expect(radios[0].getAttribute('aria-checked')).toBe('true');
	});

	it('shows key caps 1–N and the unknown key, counts, and a dashed suggestion', () => {
		render(ScalePicker, {
			scale: confidence,
			keycaps: true,
			suggested: 'c3',
			counts: { c1: 1200, unknown: 4 }
		});
		const radios = screen.getAllByRole('radio');
		expect(radios.map((r) => r.getAttribute('aria-keyshortcuts'))).toEqual([
			'1', '2', '3', '4', '5', '6', '7', '8', '0'
		]);
		expect(radios[0].textContent).toContain('1,200');
		expect(radios[8].textContent).toContain('4');
		expect(radios[2].dataset.suggested).toBe('');
		expect(radios[2].getAttribute('aria-checked')).toBe('false');
	});

	it('keeps no click of its own when controlled', async () => {
		const onchange = vi.fn();
		render(ScalePicker, { scale: confidence, value: 'c2', controlled: true, onchange });
		await fireEvent.click(screen.getByRole('radio', { name: 'Certain' }));
		expect(onchange).toHaveBeenCalledWith('c8');
		expect(screen.getByRole('radio', { name: 'Unlikely' }).getAttribute('aria-checked')).toBe('true');
	});

	it('takes a fixed column count', () => {
		render(ScalePicker, { scale: confidence, columns: 3 });
		const row = screen.getByRole('radiogroup');
		expect(row.style.getPropertyValue('--cols')).toBe('3');
		expect(document.querySelector('.ds-scalepicker')?.getAttribute('data-columns')).toBe('fixed');
	});
});
