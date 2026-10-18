// The long-form article (`ds-article` in base.css) in a real browser (Chromium): its two columns,
// centering in the page column, fitting a capped column and a phone, the header (kicker, fluid
// title, space above, meta separators), a component's place in the rhythm, and the Ghost mapping.
import '../tokens.css';
import '../base.css';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from '@testing-library/svelte';
import ArticleHarness from '../../tests/browser/ArticleHarness.svelte';
import GhostHarness from '../../tests/browser/GhostHarness.svelte';
import GhostCardsHarness from '../../tests/browser/GhostCardsHarness.svelte';
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

// Every other card Ghost renders on the web, with and without the `ghostCards` attachment.
describe('ds-article-ghost cards in a browser', () => {
	const el = <E extends Element = HTMLElement>(id: string) =>
		document.querySelector<E>(`[data-testid="${id}"]`)!;
	const shown = (node: Element) => getComputedStyle(node).display !== 'none';
	/** A role's color as the browser computes it, from a probe in the article. */
	const role = (name: string, prop: 'color' | 'backgroundColor' = 'color') => {
		const probe = document.createElement('span');
		probe.style.setProperty(prop === 'color' ? 'color' : 'background-color', `var(${name})`);
		document.querySelector('.ds-article')!.append(probe);
		const value = getComputedStyle(probe)[prop];
		probe.remove();
		return value;
	};
	const rgba = (c: string) => {
		const m = /rgba?\(([^)]+)\)/.exec(c);
		if (!m) throw new Error(`not a color: ${c}`);
		const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
		return [r, g, b, a] as const;
	};
	const over = (top: string, under: readonly number[]) => {
		const [r, g, b, a] = rgba(top);
		return [r, g, b].map((v, i) => v * a + under[i] * (1 - a));
	};
	const luminance = (rgb: readonly number[]) => {
		const [r, g, b] = rgb.map((v) => {
			const s = v / 255;
			return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const contrast = (a: readonly number[], b: readonly number[]) => {
		const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
		return (hi + 0.05) / (lo + 0.05);
	};
	const inner = () => {
		const main = document.querySelector('#ds-main')!;
		return Math.round(main.clientWidth - 2 * parseFloat(getComputedStyle(main).paddingLeft));
	};
	const cards = [
		'button',
		'header-image',
		'header-dark',
		'header-accent',
		'header-v2',
		'header-v2-image',
		'header-split',
		'file',
		'product',
		'cta',
		'cta-immersive',
		'signup',
		'toggle',
		'audio',
		'video',
		'gallery',
		'embed-video',
		'embed-audio',
		'transistor',
		'quote',
		'code'
	];

	it('lays out every card in its column at 1280px', async () => {
		await page.viewport(1280, 800);
		render(GhostCardsHarness);
		await settle();
		const full = inner();
		const expected: Record<string, number> = {
			button: 720,
			'header-image': full,
			'header-dark': full,
			'header-v2': 720,
			'header-v2-image': 1120,
			'header-split': full,
			file: 720,
			product: 560,
			cta: 720,
			signup: 720,
			toggle: 720,
			audio: 720,
			video: 1120,
			gallery: 1120,
			quote: 720,
			code: 720
		};
		for (const [id, w] of Object.entries(expected)) expect(width(`[data-testid="${id}"]`), id).toBe(w);
		// The product card is centered in the text column.
		const para = box('[data-testid="para"]');
		const product = box('[data-testid="product"]');
		expect(Math.abs(product.left - para.left - (para.right - product.right))).toBeLessThanOrEqual(1);
		// A full-width band keeps its text on the text column.
		const heading = box('[data-testid="header-image"] .kg-header-card-header');
		expect(heading.width).toBeLessThanOrEqual(721);
		// The split band: the image beside the text, after it when swapped.
		const split = el('header-split');
		const text = split.querySelector('.kg-header-card-text')!.getBoundingClientRect();
		const image = split.querySelector('picture')!.getBoundingClientRect();
		expect(Math.abs(text.width - image.width)).toBeLessThanOrEqual(1);
		expect(text.right).toBeLessThanOrEqual(image.left + 1);
		expect(image.height).toBeGreaterThan(100);
		// A minimal call to action is a row; the immersive one stacks, its button full width.
		const cta = el('cta');
		expect(getComputedStyle(cta.querySelector('.kg-cta-content')!).flexDirection).toBe('row');
		expect(Math.round(cta.querySelector('.kg-cta-image-container img')!.getBoundingClientRect().width)).toBe(64);
		const stacked = el('cta-immersive');
		expect(getComputedStyle(stacked.querySelector('.kg-cta-content')!).flexDirection).toBe('column');
		expect(Math.round(stacked.querySelector('.kg-cta-button')!.getBoundingClientRect().width)).toBe(
			Math.round(stacked.querySelector('.kg-cta-content-inner')!.getBoundingClientRect().width)
		);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(1280);
	});

	it('fits every card to a phone, with no sideways scroll inside a card or on the page', async () => {
		await page.viewport(375, 800);
		render(GhostCardsHarness);
		await settle();
		const full = inner();
		for (const id of cards) {
			const card = el(id);
			expect(Math.round(card.getBoundingClientRect().width), id).toBeLessThanOrEqual(full);
			expect(card.scrollWidth, id).toBeLessThanOrEqual(card.clientWidth + 1);
		}
		for (const id of ['header-image', 'header-split', 'video', 'gallery', 'header-v2-image'])
			expect(width(`[data-testid="${id}"]`), id).toBe(full);
		// A split band stacks.
		const split = el('header-split');
		const text = split.querySelector('.kg-header-card-text')!.getBoundingClientRect();
		const image = split.querySelector('picture')!.getBoundingClientRect();
		expect(Math.round(text.width)).toBe(full);
		expect(Math.round(image.width)).toBe(full);
		// A minimal call to action stacks too; a signup's field and button share the width or wrap.
		expect(getComputedStyle(el('cta').querySelector('.kg-cta-content')!).flexDirection).toBe('column');
		const input = el('signup').querySelector('.kg-signup-card-input')!.getBoundingClientRect();
		const fields = el('signup').querySelector('.kg-signup-card-fields')!.getBoundingClientRect();
		expect(input.right).toBeLessThanOrEqual(fields.right + 1);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(375);
	});

	it('gives buttons the Button look: primary for the accent, secondary otherwise', async () => {
		await page.viewport(1280, 800);
		render(GhostCardsHarness);
		await settle();
		const accent = role('--ds-accent', 'backgroundColor');
		const primary = getComputedStyle(el('button').querySelector('.kg-btn')!);
		expect(primary.backgroundColor).toBe(accent);
		expect(primary.color).toBe(role('--ds-accent-contrast'));
		expect(Number(primary.fontWeight)).toBeLessThanOrEqual(500);
		expect(parseFloat(primary.fontSize)).toBeGreaterThanOrEqual(12);
		expect(primary.textDecorationLine).toBe('none');
		expect(el('button').querySelector('.kg-btn')!.getBoundingClientRect().height).toBeGreaterThanOrEqual(36);
		const secondary = getComputedStyle(el('button-left').querySelector('.kg-btn')!);
		expect(secondary.backgroundColor).toBe(role('--ds-bg-4', 'backgroundColor'));
		// Centered or on the left.
		const center = box('[data-testid="button"] .kg-btn');
		const card = box('[data-testid="button"]');
		expect(Math.abs(center.left - card.left - (card.right - center.right))).toBeLessThanOrEqual(1);
		expect(Math.round(box('[data-testid="button-left"] .kg-btn').left)).toBe(
			Math.round(box('[data-testid="button-left"]').left)
		);
		// Header v1's button and the accent buttons in the other cards are primary.
		for (const selector of [
			'[data-testid="header-image"] .kg-header-card-button',
			'[data-testid="header-v2"] .kg-header-card-button',
			'[data-testid="product"] .kg-product-card-button',
			'[data-testid="signup"] .kg-signup-card-button',
			'[data-testid="cta-immersive"] .kg-cta-button'
		])
			expect(style(selector).backgroundColor, selector).toBe(accent);
		// The editor's own button color is dropped: a plain call-to-action button is secondary.
		expect(style('[data-testid="cta"] .kg-cta-button').backgroundColor).toBe(
			role('--ds-bg-4', 'backgroundColor')
		);
	});

	it('keeps header text at 4.5:1 or more over an image, on a white one at worst, and on each style', async () => {
		await page.viewport(1280, 800);
		render(GhostCardsHarness);
		await settle();
		const white = [255, 255, 255];
		for (const id of ['header-image', 'header-v2-image']) {
			const card = el(id);
			const scrim = over(getComputedStyle(card, '::after').backgroundColor, white);
			for (const text of card.querySelectorAll('h2, h3, .kg-header-card-subheading')) {
				const color = rgba(getComputedStyle(text).color);
				expect(contrast(color, scrim), `${id} ${text.className}`).toBeGreaterThanOrEqual(4.5);
			}
		}
		for (const id of ['header-dark', 'header-accent', 'header-v2', 'header-split']) {
			const card = el(id);
			const ground = rgba(getComputedStyle(card).backgroundColor);
			expect(ground[3], id).toBe(1);
			for (const text of card.querySelectorAll('h2, h3, .kg-header-card-subheading'))
				expect(
					contrast(rgba(getComputedStyle(text).color), ground),
					`${id} ${text.className}`
				).toBeGreaterThanOrEqual(4.5);
		}
		// A v2 card's black background reads as the dark tone, on the deepest ground.
		expect(getComputedStyle(el('header-v2')).backgroundColor).toBe(role('--ds-bg-0', 'backgroundColor'));
		expect(getComputedStyle(el('header-split')).backgroundColor).toBe(
			role('--ds-bg-3', 'backgroundColor')
		);
	});

	it('shows toggle content without the script, and hides closed content once enhanced', async () => {
		await page.viewport(1280, 800);
		const plain = render(GhostCardsHarness, { enhance: false });
		await settle();
		const content = () => el('toggle').querySelector('.kg-toggle-content')!;
		expect(shown(content())).toBe(true);
		expect(content().getBoundingClientRect().height).toBeGreaterThan(0);
		expect(shown(el('toggle').querySelector('.kg-toggle-card-icon')!)).toBe(false);
		expect(el('toggle').querySelector('.kg-toggle-heading-text > button')).toBeNull();
		plain.unmount();

		render(GhostCardsHarness);
		await settle();
		expect(shown(content())).toBe(false);
		expect(shown(el('toggle').querySelector('.kg-toggle-card-icon')!)).toBe(true);
		const button = el('toggle').querySelector<HTMLButtonElement>('.kg-toggle-heading-text > button')!;
		await userEvent.click(button);
		expect(shown(content())).toBe(true);
		expect(button.getAttribute('aria-expanded')).toBe('true');
		// The keyboard: Enter and Space on the focused heading button.
		button.focus();
		await userEvent.keyboard('{Enter}');
		expect(shown(content())).toBe(false);
		expect(button.getAttribute('aria-expanded')).toBe('false');
		await userEvent.keyboard(' ');
		expect(shown(content())).toBe(true);
		expect(document.activeElement).toBe(button);
	});

	it('styles the signup states by the classes on the form', async () => {
		await page.viewport(1280, 800);
		render(GhostCardsHarness);
		await settle();
		const part = (id: string, cls: string) => el(id).querySelector(`.${cls}`)!;
		expect(shown(part('signup', 'kg-signup-card-fields'))).toBe(true);
		expect(shown(part('signup', 'kg-signup-card-success'))).toBe(false);
		expect(shown(part('signup', 'kg-signup-card-error'))).toBe(false);
		expect(shown(part('signup', 'kg-signup-card-button-loading'))).toBe(false);
		expect(shown(part('signup-success', 'kg-signup-card-fields'))).toBe(false);
		expect(shown(part('signup-success', 'kg-signup-card-success'))).toBe(true);
		expect(shown(part('signup-success', 'kg-signup-card-disclaimer'))).toBe(false);
		expect(shown(part('signup-error', 'kg-signup-card-error'))).toBe(true);
		expect(shown(part('signup-error', 'kg-signup-card-fields'))).toBe(true);
		expect(getComputedStyle(part('signup-error', 'kg-signup-card-input')).borderTopColor).toBe(
			role('--ds-danger')
		);
		expect(shown(part('signup-loading', 'kg-signup-card-button-loading'))).toBe(true);
		expect(getComputedStyle(part('signup-loading', 'kg-signup-card-button-default')).color).toBe(
			'rgba(0, 0, 0, 0)'
		);
		// The card Ghost rendered hidden stays hidden: showing it is the site's own wiring.
		expect(shown(el('signup-hidden'))).toBe(false);
		// The field is a control: 36px, 14px text, text on a ground that passes.
		const input = getComputedStyle(part('signup', 'kg-signup-card-input'));
		expect(parseFloat(input.height)).toBeGreaterThanOrEqual(36);
		expect(contrast(rgba(input.color), rgba(input.backgroundColor))).toBeGreaterThanOrEqual(4.5);
	});

	it('plays audio and video in native controls, and hides Ghost\'s own player', async () => {
		await page.viewport(1280, 800);
		const plain = render(GhostCardsHarness, { enhance: false });
		await settle();
		expect(el('audio').querySelector('audio')!.hasAttribute('controls')).toBe(false);
		expect(shown(el('audio').querySelector('.kg-audio-player')!)).toBe(false);
		expect(shown(el('video').querySelector('.kg-video-overlay')!)).toBe(false);
		plain.unmount();
		render(GhostCardsHarness);
		await settle();
		const audio = el('audio').querySelector('audio')!;
		expect(audio.hasAttribute('controls')).toBe(true);
		expect(audio.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(shown(el('audio').querySelector('.kg-audio-player')!)).toBe(false);
		expect(Math.round(el('audio').querySelector('.kg-audio-thumbnail')!.getBoundingClientRect().width)).toBe(64);
		const video = el('video').querySelector('video')!;
		expect(video.hasAttribute('controls')).toBe(true);
		// The video keeps its own aspect ratio from its width and height.
		const v = video.getBoundingClientRect();
		expect(Math.round(v.width)).toBe(1120);
		expect(Math.abs(v.height - (1120 * 360) / 640)).toBeLessThanOrEqual(1);
		expect(shown(el('video').querySelector('.kg-video-player-container')!)).toBe(false);
	});

	it('justifies a gallery row from the image sizes, and sizes embeds from their attributes', async () => {
		await page.viewport(1280, 800);
		const plain = render(GhostCardsHarness, { enhance: false });
		await settle();
		// Without the script: equal shares, and a player at 16:9.
		const imgs = () =>
			[...el('gallery').querySelectorAll('img')].map((i) => i.getBoundingClientRect());
		const equal = imgs();
		expect(Math.abs(equal[0].width - equal[1].width)).toBeLessThanOrEqual(1);
		expect(Math.abs(box('[data-testid="embed-audio"] iframe').height - (720 * 9) / 16)).toBeLessThanOrEqual(1);
		plain.unmount();

		render(GhostCardsHarness);
		await settle();
		// With it: each image whole, at its own aspect ratio, all at one height across the row.
		const rows = imgs();
		const ratios = [300 / 200, 200 / 300, 1];
		rows.forEach((r, i) => {
			expect(Math.abs(r.height - rows[0].height)).toBeLessThanOrEqual(1);
			expect(Math.abs(r.width / r.height - ratios[i])).toBeLessThanOrEqual(0.02);
		});
		const total = rows.reduce((sum, r) => sum + r.width, 0) + 2 * 8;
		expect(Math.abs(total - 1120)).toBeLessThanOrEqual(1);
		// A video player at its own ratio, a podcast player at its own: neither forced to 16:9.
		const video = box('[data-testid="embed-video"] iframe');
		expect(Math.round(video.width)).toBe(720);
		expect(Math.abs(video.height - (720 * 113) / 200)).toBeLessThanOrEqual(1);
		const audio = box('[data-testid="embed-audio"] iframe');
		expect(Math.round(audio.width)).toBe(720);
		expect(Math.abs(audio.height - (720 * 180) / 640)).toBeLessThanOrEqual(1);
		// Sized in percent, a player keeps its own height, with or without the script.
		for (const id of ['embed-percent', 'transistor']) {
			const frame = box(`[data-testid="${id}"] iframe`);
			expect(Math.round(frame.width), id).toBe(720);
			expect(Math.round(frame.height), id).toBe(180);
		}
	});

	it('renders the other blocks: the alternate quote, the code card, the divider, the file and product cards', async () => {
		await page.viewport(1280, 800);
		render(GhostCardsHarness);
		await settle();
		const quote = style('[data-testid="quote"]');
		expect(quote.textAlign).toBe('center');
		expect(quote.fontSize).toBe('24px');
		expect(quote.borderLeftWidth).toBe('0px');
		expect(style('[data-testid="code"] pre').marginTop).toBe('0px');
		expect(style('[data-testid="code"] pre').backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		expect(style('[data-testid="hr"]').borderTopWidth).toBe('1px');
		const file = style('[data-testid="file"] .kg-file-card-container');
		expect(file.display).toBe('flex');
		expect(file.borderTopWidth).toBe('1px');
		expect(file.textDecorationLine).toBe('none');
		expect(style('[data-testid="file"] .kg-file-card-filename').textOverflow).toBe('ellipsis');
		// The rating: four active stars in the accent, one outlined, named as one image.
		const rating = el('product').querySelector('.kg-product-card-rating')!;
		expect(rating.getAttribute('aria-label')).toBe('4 of 5 stars');
		const starsOn = [...rating.querySelectorAll('.kg-product-card-rating-active svg')];
		expect(starsOn).toHaveLength(4);
		expect(getComputedStyle(starsOn[0]).fill).toBe(role('--ds-accent'));
		expect(getComputedStyle(rating.querySelector('.kg-product-card-rating-star:not(.kg-product-card-rating-active) svg')!).fill).toBe('none');
		// Nothing below 12px, nothing above weight 500, across the cards.
		for (const node of document.querySelectorAll('.ds-article-ghost [class*="kg-"], .ds-article-ghost [class*="kg-"] *')) {
			const s = getComputedStyle(node);
			if (s.display === 'none' || !node.textContent?.trim()) continue;
			expect(parseFloat(s.fontSize), node.className.toString()).toBeGreaterThanOrEqual(12);
			expect(Number(s.fontWeight), node.className.toString()).toBeLessThanOrEqual(500);
		}
	});
});
