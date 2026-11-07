import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ChoiceTiles from './ChoiceTiles.svelte';

const options = [
	{ value: 'a', label: 'Unit A', meta: 'Idle since 09:00' },
	{ value: 'b', label: 'Unit B', meta: 'Running job 412', status: { label: 'In use', tone: 'accent' as const } },
	{ value: 'c', label: 'Unit C', disabled: true },
	{ value: 'd', label: 'Unit D' }
];

describe('ChoiceTiles', () => {
	it('is a named radio group with one tab stop, on the chosen tile', () => {
		render(ChoiceTiles, { options, value: 'b', label: 'Unit' });
		expect(screen.getByRole('radiogroup', { name: 'Unit' })).toBeTruthy();
		const radios = screen.getAllByRole('radio');
		expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false', 'false']);
		expect(radios.map((r) => r.tabIndex)).toEqual([-1, 0, -1, -1]);
		expect(radios[1].textContent).toContain('Running job 412');
		expect(radios[1].textContent).toContain('In use');
	});

	it('puts the tab stop on the first enabled tile when nothing is chosen', () => {
		render(ChoiceTiles, { options, label: 'Unit' });
		expect(screen.getAllByRole('radio').map((r) => r.tabIndex)).toEqual([0, -1, -1, -1]);
	});

	it('chooses on click and reports it once', async () => {
		const onchange = vi.fn();
		render(ChoiceTiles, { options, value: 'a', label: 'Unit', onchange });
		await fireEvent.click(screen.getByRole('radio', { name: /Unit D/ }));
		expect(onchange).toHaveBeenCalledWith('d');
		await fireEvent.click(screen.getByRole('radio', { name: /Unit D/ }));
		expect(onchange).toHaveBeenCalledOnce();
	});

	it('moves and selects with the arrow keys, skipping disabled tiles, and jumps with Home and End', async () => {
		const onchange = vi.fn();
		render(ChoiceTiles, { options, value: 'b', label: 'Unit', onchange });
		const group = screen.getByRole('radiogroup');
		await fireEvent.keyDown(group, { key: 'ArrowRight' });
		expect(onchange).toHaveBeenLastCalledWith('d');
		expect(document.activeElement?.textContent).toContain('Unit D');
		await fireEvent.keyDown(group, { key: 'ArrowDown' });
		expect(onchange).toHaveBeenLastCalledWith('a');
		await fireEvent.keyDown(group, { key: 'End' });
		expect(onchange).toHaveBeenLastCalledWith('d');
		await fireEvent.keyDown(group, { key: 'Home' });
		expect(onchange).toHaveBeenLastCalledWith('a');
	});

	it('never chooses a disabled tile', async () => {
		const onchange = vi.fn();
		render(ChoiceTiles, { options, value: 'a', label: 'Unit', onchange });
		const c = screen.getByRole('radio', { name: /Unit C/ });
		expect((c as HTMLButtonElement).disabled).toBe(true);
		await fireEvent.click(c);
		expect(onchange).not.toHaveBeenCalled();
	});
});
