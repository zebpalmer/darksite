// The search palette in a real browser (Chromium): the top layer, modality, real focus, the keys
// and the layout at desktop and phone widths.
import '../tokens.css';
import '../base.css';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render, screen } from '@testing-library/svelte';
import SearchHarness from '../../tests/SearchHarness.svelte';

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const field = () => screen.getByRole('combobox', { name: 'Search' }) as HTMLInputElement;

afterEach(async () => {
	await page.viewport(1280, 800);
	history.replaceState(null, '', location.pathname + location.search);
});

describe('SearchPalette in a browser', () => {
	it('opens on / as a modal in the top layer, focus in the field', async () => {
		render(SearchHarness, { shortcut: true });
		(document.activeElement as HTMLElement | null)?.blur();
		await userEvent.keyboard('/');
		const dialog = await screen.findByRole('dialog', { name: 'Search' });
		expect(dialog.matches(':modal')).toBe(true);
		await settle();
		expect(document.activeElement).toBe(field());
		// The `/` opened it; it was not typed into the field.
		expect(field().value).toBe('');
		// The page behind is inert: Tab stays inside, or leaves for the browser itself.
		for (let i = 0; i < 4; i++) {
			await userEvent.keyboard('{Tab}');
			expect(
				document.activeElement !== document.body && !dialog.contains(document.activeElement)
			).toBe(false);
		}
	});

	it('stands aside while the user types in a field', async () => {
		render(SearchHarness, { shortcut: true });
		await userEvent.click(screen.getByRole('textbox', { name: 'Elsewhere' }));
		await userEvent.keyboard('/');
		expect(screen.queryByRole('dialog')).toBeNull();
		expect((screen.getByRole('textbox', { name: 'Elsewhere' }) as HTMLInputElement).value).toBe('/');
	});

	it('moves with the arrows and follows the active row on Enter', async () => {
		render(SearchHarness);
		await userEvent.click(screen.getByRole('button', { name: 'Open search' }));
		await settle();
		await userEvent.keyboard('er');
		await screen.findByRole('listbox');
		const input = field();
		const options = screen.getAllByRole('option');
		expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
		await userEvent.keyboard('{ArrowDown}');
		expect(input.getAttribute('aria-activedescendant')).toBe(options[1].id);
		expect(document.activeElement).toBe(input);
		const href = options[1].getAttribute('href');
		await userEvent.keyboard('{Enter}');
		await settle();
		expect(location.hash).toBe(href);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('closes on Esc and returns focus to the opener', async () => {
		render(SearchHarness);
		const opener = screen.getByRole('button', { name: 'Open search' });
		await userEvent.click(opener);
		await settle();
		await userEvent.keyboard('rec');
		await screen.findByRole('listbox');
		await userEvent.keyboard('{Escape}');
		await settle();
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(opener);
	});

	it('sits near the top at 640px on a desktop, no taller than 70% of the viewport', async () => {
		render(SearchHarness);
		await userEvent.click(screen.getByRole('button', { name: 'Open search' }));
		await settle();
		await userEvent.keyboard('r');
		await screen.findByRole('listbox');
		await settle();
		// The dialog, not its panel, which may still be finishing its opening scale.
		const panel = document.querySelector<HTMLElement>('.ds-searchpalette')!.getBoundingClientRect();
		expect(Math.round(panel.width)).toBe(640);
		expect(panel.top).toBeGreaterThan(40);
		expect(panel.top).toBeLessThan(120);
		expect(panel.height).toBeLessThanOrEqual(800 * 0.7 + 1);
		const foot = document.querySelector('.ds-searchpalette .foot')!;
		expect(getComputedStyle(foot).display).not.toBe('none');
	});

	it('fills a phone screen, with a close button and no key hints', async () => {
		await page.viewport(375, 700);
		render(SearchHarness);
		await userEvent.click(screen.getByRole('button', { name: 'Open search' }));
		await settle();
		const panel = document.querySelector<HTMLElement>('.ds-searchpalette')!.getBoundingClientRect();
		expect(Math.round(panel.width)).toBe(375);
		expect(Math.round(panel.height)).toBe(700);
		expect(getComputedStyle(document.querySelector('.ds-searchpalette .foot')!).display).toBe('none');
		await userEvent.click(screen.getByRole('button', { name: 'Close' }));
		await settle();
		expect(screen.queryByRole('dialog')).toBeNull();
	});
});
