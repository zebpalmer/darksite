import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ModePicker from './components/ModePicker.svelte';
import { ModeStore } from './mode.svelte.js';

afterEach(() => {
	document.documentElement.removeAttribute('data-ds-theme');
	localStorage.clear();
});

describe('ModeStore', () => {
	it('applies a mode to <html>, saves it, and tells subscribers', () => {
		const store = new ModeStore();
		const seen = vi.fn();
		store.subscribe(seen);
		store.set('paper');
		expect(document.documentElement.getAttribute('data-ds-theme')).toBe('paper');
		expect(localStorage.getItem('darksite:mode')).toBe('paper');
		expect(seen).toHaveBeenCalledWith('paper');
		store.set('system');
		expect(document.documentElement.hasAttribute('data-ds-theme')).toBe(false);
	});

	it('restores the saved choice, and takes an account value over it', () => {
		localStorage.setItem('darksite:mode', 'night');
		const store = new ModeStore();
		store.init();
		expect(store.current).toBe('night');
		store.init({ initial: 'light' });
		expect(document.documentElement.getAttribute('data-ds-theme')).toBe('light');
	});
});

describe('ModePicker', () => {
	it('is a labeled select that sets the mode', async () => {
		const store = new ModeStore();
		render(ModePicker, { store });
		const select = screen.getByRole('combobox', { name: 'Theme' }) as HTMLSelectElement;
		expect([...select.options].map((o) => o.textContent)).toEqual([
			'System',
			'Dark',
			'Light',
			'Paper',
			'Night',
			'High contrast'
		]);
		await fireEvent.change(select, { target: { value: 'night' } });
		expect(store.current).toBe('night');
	});

	it('shows the choices side by side', async () => {
		const store = new ModeStore();
		render(ModePicker, { store, variant: 'segmented', modes: ['dark', 'paper'] });
		await fireEvent.click(screen.getByRole('radio', { name: 'Paper' }));
		expect(store.current).toBe('paper');
	});
});
