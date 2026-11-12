// Runs in a real browser (Chromium): container queries and layout.
import '../tokens.css';
import '../base.css';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Tracker from './Tracker.svelte';

const steps = ['Asked', 'Checked', 'Approved', 'Downloading', 'Triaged', 'In the library'];
const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

function frame(width: number): HTMLElement {
	const el = document.createElement('div');
	el.style.width = `${width}px`;
	document.body.append(el);
	return el;
}
const visible = (list: Element) =>
	[...list.querySelectorAll('.step')].filter((li) => {
		const r = li.querySelector('.name')!.getBoundingClientRect();
		return r.width > 2 && r.height > 2;
	});

describe('Tracker in a browser', () => {
	it('shows every label when there is room', async () => {
		const target = frame(720);
		render(Tracker, { target, props: { steps, current: 3 } });
		await settle();
		expect(visible(target.querySelector('.ds-tracker')!).length).toBe(6);
	});

	it('shows only the current label at 320px, and does not scroll sideways', async () => {
		const target = frame(320);
		render(Tracker, { target, props: { steps, current: 3 } });
		await settle();
		const list = target.querySelector('.ds-tracker') as HTMLElement;
		const shown = visible(list);
		expect(shown.length).toBe(1);
		expect(shown[0].getAttribute('aria-current')).toBe('step');
		expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
		// The marks stay: every step still has a segment.
		expect(list.querySelectorAll('.step').length).toBe(6);
	});
});
