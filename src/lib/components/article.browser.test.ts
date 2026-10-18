// The long-form article (`ds-article` in base.css) in a real browser (Chromium): its two columns,
// centering in the page column, fitting a capped column and a phone, the header (kicker, fluid
// title, space above, meta separators), a component's place in the rhythm, and the Ghost mapping.
import '../tokens.css';
import '../base.css';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/svelte';
import ArticleHarness from '../../tests/browser/ArticleHarness.svelte';
import GhostHarness from '../../tests/browser/GhostHarness.svelte';
import CodeBlock from './CodeBlock.svelte';

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
const width = (selector: string) => Math.round(box(selector).width);
const style = (selector: string) => getComputedStyle(document.querySelector(selector)!);
// Where an element's text starts, without its ::before (a range holds no pseudo-elements).
const textBox = (el: Element) => {
	const range = document.createRange();
	range.selectNodeContents(el);
	return range.getBoundingClientRect();
};

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
		const firstMeta = document.querySelector('.ds-article-meta > *')!;
		expect(Math.round(textBox(firstMeta).left)).toBe(Math.round(text.left));
		expect(Math.round(box('.ds-article-kicker').left)).toBe(Math.round(text.left));
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

	it('sizes the title from its custom property, or a fluid default in the article width', async () => {
		await page.viewport(1280, 800);
		const wide = render(ArticleHarness);
		await settle();
		// 1120px wide: the default reaches its 52px ceiling.
		expect(style('.ds-article h1').fontSize).toBe('52px');
		expect(Number(style('.ds-article h1').fontWeight)).toBeLessThanOrEqual(500);
		wide.unmount();
		// 600px wide: 12px + 3.6cqi.
		const narrow = render(ArticleHarness, { contentWidth: 600 });
		await settle();
		expect(parseFloat(style('.ds-article h1').fontSize)).toBeCloseTo(12 + 0.036 * 600, 1);
		narrow.unmount();
		render(ArticleHarness, { style: '--ds-article-title-size: 40px' });
		await settle();
		expect(style('.ds-article h1').fontSize).toBe('40px');
	});

	it('leaves fluid space above the header, which a custom property overrides', async () => {
		await page.viewport(1280, 800);
		const wide = render(ArticleHarness);
		await settle();
		expect(style('.ds-article > header').paddingTop).toBe('48px');
		expect(Math.round(box('.ds-article-kicker').top - box('.ds-article').top)).toBe(48);
		// The kicker sits 12px above the title, at 13px and weight 500.
		expect(Math.round(box('.ds-article h1').top - box('.ds-article-kicker').bottom)).toBe(12);
		expect(style('.ds-article-kicker').fontSize).toBe('13px');
		expect(Number(style('.ds-article-kicker').fontWeight)).toBeLessThanOrEqual(500);
		wide.unmount();
		const custom = render(ArticleHarness, { style: '--ds-article-header-space: 10px' });
		await settle();
		expect(style('.ds-article > header').paddingTop).toBe('10px');
		custom.unmount();
		await page.viewport(375, 800);
		render(ArticleHarness);
		await settle();
		expect(style('.ds-article > header').paddingTop).toBe('24px');
	});

	it('gives a CodeBlock placed directly in the article the article rhythm', async () => {
		await page.viewport(1280, 800);
		render(ArticleHarness);
		await settle();
		const before = box('[data-testid="before-code"]');
		const code = box('.article-code');
		expect(Math.round(code.top - before.bottom)).toBe(40);
		expect(width('.article-code')).toBe(720);
		const after = (document.querySelector('.article-code')!.nextElementSibling as Element)
			.getBoundingClientRect();
		expect(Math.round(after.top - code.bottom)).toBe(40);
	});

	it('keeps a CodeBlock elsewhere free of the browser figure margin', async () => {
		render(CodeBlock, { code: 'tool run', class: 'alone' });
		await settle();
		const s = style('.alone');
		expect([s.marginTop, s.marginRight, s.marginBottom, s.marginLeft]).toEqual([
			'0px',
			'0px',
			'0px',
			'0px'
		]);
	});

	it('never starts a meta line with a separator on a phone', async () => {
		await page.viewport(375, 800);
		render(ArticleHarness);
		await settle();
		const meta = document.querySelector('.ds-article-meta')!;
		const metaLeft = meta.getBoundingClientRect().left;
		const column = box('[data-testid="para"]').left;
		const sep = parseFloat(getComputedStyle(meta).getPropertyValue('--meta-sep'));
		// The clip hides the strip left of the column, where each line's first separator sits.
		expect(getComputedStyle(meta).clipPath).toBe(`inset(-8px -8px -8px ${sep - 4}px)`);
		const items = [...meta.children];
		const tops = new Set<number>();
		let previousTop = -1;
		for (const item of items) {
			const outer = item.getBoundingClientRect();
			const text = textBox(item);
			// The separator is inside its item, right before the text, on the same line.
			expect(Math.round(text.left - outer.left)).toBe(sep);
			expect(Math.abs(text.top - outer.top)).toBeLessThanOrEqual(2);
			const top = Math.round(outer.top);
			tops.add(top);
			if (top !== previousTop) {
				// The first item on a line: its separator is in the clipped strip, its text on the column.
				expect(Math.round(outer.left)).toBe(Math.round(metaLeft));
				expect(Math.round(text.left)).toBe(Math.round(column));
				expect(outer.left + sep / 2).toBeLessThan(metaLeft + sep - 4);
			} else {
				expect(outer.left).toBeGreaterThan(column);
			}
			previousTop = top;
		}
		expect(tops.size).toBeGreaterThan(1);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(375);
	});
});

describe('ds-article-ghost in a browser', () => {
	it('maps the Koenig widths and lays out a gallery row', async () => {
		await page.viewport(1280, 800);
		render(GhostHarness);
		await settle();
		const main = document.querySelector('#ds-main')!;
		const pad = parseFloat(getComputedStyle(main).paddingLeft);
		const inner = main.getBoundingClientRect().width - 2 * pad;
		const mainBox = main.getBoundingClientRect();
		expect(width('[data-testid="para"]')).toBe(720);
		expect(width('[data-testid="regular"]')).toBe(720);
		expect(width('[data-testid="wide"]')).toBe(1120);
		expect(width('[data-testid="wide"] .kg-image')).toBe(1120);
		const wideBox = box('[data-testid="wide"]');
		expect(
			Math.abs(wideBox.left - mainBox.left - (mainBox.right - wideBox.right))
		).toBeLessThanOrEqual(1);
		// Full: the whole page column, its caption back on the text column.
		expect(width('[data-testid="full"]')).toBe(Math.round(inner));
		expect(width('[data-testid="full"] .kg-image')).toBe(Math.round(inner));
		expect(width('[data-testid="full"] figcaption')).toBe(720);
		expect(Math.round(box('[data-testid="full"] figcaption').left)).toBe(
			Math.round(box('[data-testid="para"]').left)
		);
		// The gallery: wide, one row of three equal cells sharing one height, the tallest image's.
		expect(width('[data-testid="gallery"]')).toBe(1120);
		const cells = [...document.querySelectorAll('[data-testid="gallery"] .kg-gallery-image img')].map(
			(el) => el.getBoundingClientRect()
		);
		expect(cells).toHaveLength(3);
		const cell = (1120 - 2 * 8) / 3;
		for (const c of cells) {
			expect(Math.abs(c.width - cell)).toBeLessThanOrEqual(1);
			expect(Math.round(c.top)).toBe(Math.round(cells[0].top));
			expect(Math.abs(c.height - cell * 1.5)).toBeLessThanOrEqual(1);
		}
		// A bookmark is a bordered flex card; a callout is tinted; an embed fills the column at 16:9.
		expect(style('.kg-bookmark-container').display).toBe('flex');
		expect(style('.kg-bookmark-container').borderTopWidth).toBe('1px');
		expect(style('.kg-bookmark-container').textDecorationLine).toBe('none');
		expect(style('[data-testid="callout"]').backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		const embed = box('[data-testid="embed"] iframe');
		expect(Math.round(embed.width)).toBe(720);
		expect(Math.abs(embed.height - (720 * 9) / 16)).toBeLessThanOrEqual(1);
	});

	it('fits every card to a phone with no sideways scroll', async () => {
		await page.viewport(375, 800);
		render(GhostHarness);
		await settle();
		const main = document.querySelector('#ds-main')!;
		const inner = main.clientWidth - 2 * parseFloat(getComputedStyle(main).paddingLeft);
		for (const id of ['para', 'regular', 'wide', 'full', 'gallery', 'bookmark', 'embed'])
			expect(width(`[data-testid="${id}"]`)).toBe(Math.round(inner));
		expect(style('.kg-bookmark-container').flexDirection).toBe('column-reverse');
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(375);
	});
});
