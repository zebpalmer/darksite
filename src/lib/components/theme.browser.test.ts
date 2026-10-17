import '../tokens.css';
import '../base.css';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import ChromeHarness from '../../tests/browser/ChromeHarness.svelte';

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const css = (el: Element, prop: string) => getComputedStyle(el).getPropertyValue(prop).trim();
// The computed color of a custom property, through a probe element.
function colorOf(variable: string, within: Element = document.documentElement) {
	const probe = document.createElement('span');
	probe.style.color = `var(${variable})`;
	within.appendChild(probe);
	const c = getComputedStyle(probe).color;
	probe.remove();
	return c;
}

describe('theme roles in a browser', () => {
	it('draws headings in the heading role, a step above the body text', async () => {
		render(ChromeHarness);
		await settle();
		const heading = colorOf('--ds-text-heading');
		expect(heading).not.toBe(colorOf('--ds-text-1'));
		expect(getComputedStyle(document.querySelector('.ds-pageheader .title')!).color).toBe(heading);
		expect(getComputedStyle(document.querySelector('.ds-prose h2')!).color).toBe(heading);
		expect(getComputedStyle(document.querySelector('.ds-prose p')!).color).not.toBe(heading);
	});

	it('fills a strong banner solid, in its contrast color, with an outlined action', async () => {
		render(ChromeHarness);
		await settle();
		const banner = document.querySelector('.ds-banner')!;
		expect(getComputedStyle(banner).backgroundColor).toBe(colorOf('--ds-warning-fill'));
		const on = colorOf('--ds-warning-contrast');
		expect(getComputedStyle(banner.querySelector('.msg')!).color).toBe(on);
		const button = banner.querySelector('.ds-btn')!;
		expect(getComputedStyle(button).backgroundColor).toBe('rgba(0, 0, 0, 0)');
		expect(getComputedStyle(button).borderTopColor).toBe(on);
	});

	it('publishes the sticky TopNav height as --ds-chrome-top, and a sticky TopBar sits under it', async () => {
		const top = render(ChromeHarness, { nav: 'top' });
		await settle();
		expect(css(document.documentElement, '--ds-chrome-top')).toBe('56px');
		expect(css(document.querySelector('.ds-topbar')!, 'top')).toBe('56px');
		top.unmount();
		render(ChromeHarness, { nav: 'rail' });
		await settle();
		expect(css(document.documentElement, '--ds-chrome-top')).toBe('0px');
	});
});
