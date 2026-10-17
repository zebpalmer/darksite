import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ModePicker from './components/ModePicker.svelte';
import ThemeToggle from './components/ThemeToggle.svelte';
import { MODE_SCRIPT, ModeStore, modeScript } from './mode.svelte.js';
import { resetStrings, setStrings } from './strings.svelte.js';

afterEach(() => {
	vi.unstubAllGlobals();
	document.documentElement.removeAttribute('data-ds-theme');
	localStorage.clear();
	resetStrings();
});

const theme = () => document.documentElement.getAttribute('data-ds-theme');

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
	it('applies the fallback while nothing is saved, and a saved choice over it', () => {
		const store = new ModeStore();
		store.init({ fallback: 'dark' });
		expect(store.current).toBe('dark');
		expect(theme()).toBe('dark');
		localStorage.setItem('darksite:mode', 'system');
		store.init({ fallback: 'dark' });
		expect(store.current).toBe('system');
		expect(theme()).toBeNull();
		localStorage.setItem('darksite:mode', 'not-a-mode');
		store.init();
		expect(store.current).toBe('system');
	});
});

describe('modeScript', () => {
	const run = (script: string) => new Function(script)();

	it('applies the saved mode, or the fallback, before paint', () => {
		run(modeScript('dark'));
		expect(theme()).toBe('dark');
		localStorage.setItem('darksite:mode', 'paper');
		run(modeScript('dark'));
		expect(theme()).toBe('paper');
		document.documentElement.removeAttribute('data-ds-theme');
		localStorage.setItem('darksite:mode', 'system');
		run(modeScript('dark'));
		expect(theme()).toBeNull();
	});

	it('ignores a value that is not a mode, and reads its own storage key', () => {
		localStorage.setItem('darksite:mode', '"><script>');
		run(modeScript('light'));
		expect(theme()).toBe('light');
		localStorage.setItem('app:mode', 'night');
		run(modeScript('light', 'app:mode'));
		expect(theme()).toBe('night');
	});

	it('keeps MODE_SCRIPT as the system default', () => {
		expect(MODE_SCRIPT).toBe(modeScript());
		run(MODE_SCRIPT);
		expect(theme()).toBeNull();
		localStorage.setItem('darksite:mode', 'night');
		run(MODE_SCRIPT);
		expect(theme()).toBe('night');
	});

	it('survives storage that throws', () => {
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('denied');
			}
		});
		run(modeScript('dark'));
		expect(theme()).toBe('dark');
	});
});

describe('ThemeToggle', () => {
	it('flips between dark and light, names the action, and saves the choice', async () => {
		const store = new ModeStore();
		store.set('dark', { persist: false });
		render(ThemeToggle, { store });
		const button = screen.getByRole('button', { name: 'Switch to light mode' });
		expect(button.hasAttribute('aria-pressed')).toBe(false);
		expect(button.dataset.mode).toBe('dark');
		await fireEvent.click(button);
		expect(store.current).toBe('light');
		expect(theme()).toBe('light');
		expect(localStorage.getItem('darksite:mode')).toBe('light');
		await fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
		expect(store.current).toBe('dark');
	});

	it("resolves System from the device's preference", async () => {
		vi.stubGlobal(
			'matchMedia',
			(query: string) =>
				({
					matches: query === '(prefers-color-scheme: light)',
					media: query,
					addEventListener: () => {},
					removeEventListener: () => {}
				}) as unknown as MediaQueryList
		);
		const store = new ModeStore();
		render(ThemeToggle, { store });
		// The only test here that follows the system, so the first to read the device's preference.
		const button = screen.getByRole('button', { name: 'Switch to dark mode' });
		expect(button.dataset.mode).toBe('light');
		await fireEvent.click(button);
		expect(store.current).toBe('dark');
	});

	it('flips between the two modes it is given, from any other mode to the other kind', async () => {
		const store = new ModeStore();
		store.set('paper', { persist: false });
		render(ThemeToggle, { store, modes: ['night', 'paper'] });
		await fireEvent.click(screen.getByRole('button', { name: 'Switch to night mode' }));
		expect(store.current).toBe('night');
		store.set('light', { persist: false });
		flushSync();
		await fireEvent.click(screen.getByRole('button', { name: 'Switch to night mode' }));
		expect(store.current).toBe('night');
		store.set('contrast', { persist: false });
		flushSync();
		await fireEvent.click(screen.getByRole('button', { name: 'Switch to paper mode' }));
		expect(store.current).toBe('paper');
	});

	it('takes its words from strings, a label, or a visible label', async () => {
		const store = new ModeStore();
		store.set('light', { persist: false });
		setStrings({ switchToMode: (m) => `Mode ${m}` });
		const first = render(ThemeToggle, { store });
		expect(screen.getByRole('button', { name: 'Mode Dark' })).toBeTruthy();
		first.unmount();
		const second = render(ThemeToggle, { store, label: (next: string) => `Go ${next}` });
		expect(screen.getByRole('button', { name: 'Go dark' })).toBeTruthy();
		second.unmount();
		resetStrings();
		render(ThemeToggle, { store, showLabel: 'Appearance' });
		const button = screen.getByRole('button', { name: 'Appearance: Switch to dark mode' });
		expect(button.textContent).toContain('Appearance');
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
