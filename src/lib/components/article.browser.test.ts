// The long-form article (`ds-article` in base.css) in a real browser (Chromium): its two columns,
// centering in the page column, and fitting a capped column and a phone.
import '../tokens.css';
import '../base.css';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/svelte';
import ArticleHarness from '../../tests/browser/ArticleHarness.svelte';

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
const width = (selector: string) => Math.round(box(selector).width);

afterEach(async () => {
	await page.viewport(1280, 800);
});

describe('ds-article in a browser', () => {
	it('sets a 720px text column inside a 1120px wide column, centered in the page', async () => {
		await page.viewport(1280, 800);
		render(ArticleHarness);
		await settle();
		expect(width('.ds-article')).toBe(1120);
		expect(width('[data-testid="para"]')).toBe(720);
		expect(width('[data-testid="wide"]')).toBe(1120);
		const main = box('#ds-main');
		const article = box('.ds-article');
		expect(Math.abs(article.left - main.left - (main.right - article.right))).toBeLessThanOrEqual(1);
		const text = box('[data-testid="para"]');
		expect(Math.abs(text.left - main.left - (main.right - text.right))).toBeLessThanOrEqual(1);
		// The header sits in the text column, on the body's left edge.
		expect(Math.round(box('.ds-article h1').left)).toBe(Math.round(text.left));
		expect(Math.round(box('.ds-article-meta').left)).toBe(Math.round(text.left));
		const body = getComputedStyle(document.querySelector('[data-testid="para"]')!);
		expect(body.fontSize).toBe('18px');
		expect(body.lineHeight).toBe(`${18 * 1.6}px`);
		const h1 = getComputedStyle(document.querySelector('.ds-article h1')!);
		expect(Number(h1.fontWeight)).toBeLessThanOrEqual(500);
	});

	it('shrinks the wide column to a capped content width, and keeps the text column', async () => {
		await page.viewport(1280, 800);
		render(ArticleHarness, { contentWidth: true });
		await settle();
		expect(width('.ds-article')).toBe(1060);
		expect(width('[data-testid="wide"]')).toBe(1060);
		expect(width('[data-testid="para"]')).toBe(720);
		expect(Math.round(box('.ds-article').left)).toBe((1280 - 1060) / 2);
	});

	it('fits both columns to a column narrower than the text column', async () => {
		await page.viewport(1280, 800);
		render(ArticleHarness, { contentWidth: 600 });
		await settle();
		expect(width('.ds-article')).toBe(600);
		expect(width('[data-testid="para"]')).toBe(600);
		expect(width('[data-testid="wide"]')).toBe(600);
	});

	it('takes the padded column on a phone, with no sideways scroll', async () => {
		await page.viewport(375, 800);
		render(ArticleHarness);
		await settle();
		const main = document.querySelector('#ds-main')!;
		const inner = main.clientWidth - 2 * parseFloat(getComputedStyle(main).paddingLeft);
		expect(width('.ds-article')).toBe(Math.round(inner));
		expect(width('[data-testid="para"]')).toBe(Math.round(inner));
		expect(width('[data-testid="wide"]')).toBe(Math.round(inner));
		expect(Math.round(box('.ds-article').left)).toBeGreaterThanOrEqual(16);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(375);
		// A narrow article steps its title down a size.
		expect(getComputedStyle(document.querySelector('.ds-article h1')!).fontSize).toBe('24px');
	});
});
