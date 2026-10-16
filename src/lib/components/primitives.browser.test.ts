// Runs in a real browser (Chromium): container queries, layout, real focus and hit testing.
import '../tokens.css';
import '../base.css';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render, screen } from '@testing-library/svelte';
import { modals } from '../layers.svelte.js';
import PrimitivesHarness from '../../tests/browser/PrimitivesHarness.svelte';

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const box = (el: Element) => el.getBoundingClientRect();
const visibleCaps = (id: string) =>
	[...screen.getByTestId(id).querySelectorAll('.kc')].filter((k) => getComputedStyle(k).display !== 'none')
		.length;

describe('ScalePicker key caps in a browser', () => {
	it('keeps the caps while the fixed columns fit, and hides them by cell count in auto', async () => {
		render(PrimitivesHarness);
		await settle();
		// Eight stops in four columns at 500px: 125px a column, so the caps stay.
		expect(visibleCaps('caps-fixed')).toBe(8);
		// Eight stops in auto at 500px: under 8 × 104, so they go.
		expect(visibleCaps('caps-auto')).toBe(0);
	});
});

describe('JustifiedGrid tile overlays in a browser', () => {
	it('fills the tile with its first child and positions later ones against the tile', async () => {
		render(PrimitivesHarness);
		await settle();
		const tile = screen.getByTestId('tiles').querySelector('.tile')!;
		const media = box(tile.querySelector('.media')!);
		const badge = box(tile.querySelector('.badge')!);
		const t = box(tile);
		expect(Math.round(media.width)).toBe(Math.round(t.width));
		expect(Math.round(media.height)).toBe(Math.round(t.height));
		expect(Math.round(badge.left - t.left)).toBe(6);
		expect(Math.round(badge.top - t.top)).toBe(6);
		expect(Math.round(badge.width)).toBe(20);
	});
});

describe('Combobox trailing in a browser', () => {
	it('reserves --trail-w beside the chevron, as Input does', async () => {
		render(PrimitivesHarness);
		await settle();
		const pad = (id: string) =>
			parseFloat(getComputedStyle(screen.getByTestId(id).querySelector('input')!).paddingRight);
		expect(pad('combo-trail')).toBe(36 + 32);
		expect(pad('combo-plain')).toBe(36);
		const input = box(screen.getByTestId('combo-trail').querySelector('input')!);
		const cap = box(screen.getByTestId('combo-trail').querySelector('kbd')!);
		expect(cap.left).toBeGreaterThanOrEqual(input.right - 36 - 32);
	});
});

describe('Button with a disabled reason in a browser', () => {
	it('is reached by Tab, shows its reason, and neither clicks nor submits', async () => {
		const onsubmitted = vi.fn();
		render(PrimitivesHarness, { onsubmitted });
		const field = screen.getByRole('textbox', { name: 'Name' });
		const save = screen.getByRole('button', { name: 'Save' });
		field.focus();
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(save);
		await settle();
		const tip = document.getElementById(save.getAttribute('aria-describedby')!)!;
		expect(tip.textContent).toBe('Fill in the name first');
		expect(tip.matches(':popover-open')).toBe(true);
		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard(' ');
		await userEvent.click(save, { force: true });
		// Enter in the field: the form's default button is disabled, so no implicit submission.
		field.focus();
		await userEvent.keyboard('{Enter}');
		expect(onsubmitted).not.toHaveBeenCalled();
	});
});

describe('topmost above a fixed modal that is not a dialog', () => {
	it('counts the viewer as a modal and lifts the notice into it, above its ground', async () => {
		const { rerender } = render(PrimitivesHarness);
		const notice = document.querySelector<HTMLElement>('.notice')!;
		await rerender({ viewer: true });
		await settle();
		const viewer = document.querySelector('.viewer')!;
		expect(modals.open).toBe(true);
		expect(notice.parentElement).toBe(viewer);
		const r = box(notice);
		expect(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)).toBe(notice);
		await rerender({ viewer: false });
		await settle();
		expect(modals.open).toBe(false);
		expect(notice.parentElement).toBe(document.querySelector('.home'));
	});
});
