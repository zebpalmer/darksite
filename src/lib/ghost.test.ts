// The `ghostCards` attachment in jsdom: the toggle disclosure, native media controls, gallery
// shares and embed ratios from attributes, the author colors, idempotence, cleanup, content
// replaced later, and doing nothing without a document. Layout and real keys are in
// components/article.browser.test.ts.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ghostCards } from './ghost.js';
import { resetStrings, setStrings } from './strings.svelte.js';

// Synthetic cards in the shape Ghost's renderers (Koenig) write them.
const TOGGLE = `
<div class="kg-card kg-toggle-card" data-kg-toggle-state="close">
	<div class="kg-toggle-heading">
		<h4 class="kg-toggle-heading-text">How returns work</h4>
		<button class="kg-toggle-card-icon" aria-label="Expand toggle to read content">
			<svg viewBox="0 0 24 24"><path d="M23.25,7.311,12.53,18.03a.749.749,0,0,1-1.06,0L.75,7.311"></path></svg>
		</button>
	</div>
	<div class="kg-toggle-content"><p>Send it back within a month.</p></div>
</div>`;
const MEDIA = `
<div class="kg-card kg-audio-card"><div class="kg-audio-player-container"><audio src="a.mp3" preload="metadata"></audio><div class="kg-audio-title">Episode one</div></div></div>
<figure class="kg-card kg-video-card"><div class="kg-video-container"><video src="v.mp4" width="640" height="360" playsinline preload="metadata"></video></div></figure>
<figure class="kg-card kg-video-card"><div class="kg-video-container"><video src="w.mp4" controls></video></div></figure>`;
const GALLERY = `
<figure class="kg-card kg-gallery-card kg-width-wide"><div class="kg-gallery-container"><div class="kg-gallery-row">
	<div class="kg-gallery-image"><img src="1.png" width="300" height="200" alt=""></div>
	<div class="kg-gallery-image"><img src="2.png" width="200" height="300" alt=""></div>
	<div class="kg-gallery-image"><img src="3.png" alt=""></div>
</div></div></figure>`;
const EMBEDS = `
<figure class="kg-card kg-embed-card"><iframe width="560" height="315" title="Player" srcdoc="<p>Player</p>"></iframe></figure>
<figure class="kg-card kg-embed-card"><iframe width="100%" height="180" title="Podcast" srcdoc="<p>Podcast</p>"></iframe></figure>`;
const COLORED = `
<div class="kg-card kg-header-card kg-v2 kg-width-regular" style="background-color: #000000;" data-background-color="#000000">
	<div class="kg-header-card-content"><div class="kg-header-card-text">
		<h2 class="kg-header-card-heading" style="color: #FFFFFF;" data-text-color="#FFFFFF">A heading</h2>
		<a href="/x" class="kg-header-card-button" style="background-color: #ffffff;color: #000000;">Go</a>
	</div></div>
</div>
<div class="kg-card kg-signup-card kg-width-wide" data-lexical-signup-form style="background-color: #F0F0F0; display: none;">
	<div class="kg-signup-card-content"><div class="kg-signup-card-text">
		<h2 class="kg-signup-card-heading">Sign up</h2>
	</div></div>
</div>`;
const PRODUCT = `
<div class="kg-card kg-product-card"><div class="kg-product-card-container"><div class="kg-product-card-rating">
	<span class="kg-product-card-rating-active kg-product-card-rating-star"><svg></svg></span>
	<span class="kg-product-card-rating-active kg-product-card-rating-star"><svg></svg></span>
	<span class="kg-product-card-rating-active kg-product-card-rating-star"><svg></svg></span>
	<span class=" kg-product-card-rating-star"><svg></svg></span>
	<span class=" kg-product-card-rating-star"><svg></svg></span>
</div></div></div>`;

let articles: HTMLElement[] = [];
function article(html: string) {
	const el = document.createElement('article');
	el.className = 'ds-article ds-article-ghost';
	el.innerHTML = html;
	document.body.append(el);
	articles.push(el);
	return el;
}
const flush = () => new Promise((r) => setTimeout(r, 0));

afterEach(() => {
	for (const el of articles) el.remove();
	articles = [];
	resetStrings();
	vi.unstubAllGlobals();
});

describe('ghostCards: toggle cards', () => {
	it('turns the heading into a disclosure button that opens and closes the card', () => {
		const el = article(TOGGLE);
		const undo = ghostCards(el);
		const card = el.querySelector<HTMLElement>('.kg-toggle-card')!;
		const heading = card.querySelector('h4')!;
		const button = heading.querySelector('button')!;
		const content = card.querySelector('.kg-toggle-content')!;
		// A native button inside the heading, named by the heading: Enter and Space work natively.
		expect(button.type).toBe('button');
		expect(button.textContent).toBe('How returns work');
		expect(heading.tagName).toBe('H4');
		expect(content.id).toMatch(/^ds-ghost-toggle-\d+$/);
		expect(button.getAttribute('aria-controls')).toBe(content.id);
		expect(button.getAttribute('aria-expanded')).toBe('false');
		expect(card.hasAttribute('data-ds-toggle')).toBe(true);
		// Ghost's icon button is a picture of the state now, out of the tab order.
		const icon = card.querySelector('.kg-toggle-card-icon')!;
		expect(icon.getAttribute('tabindex')).toBe('-1');
		expect(icon.getAttribute('aria-hidden')).toBe('true');

		button.click();
		expect(card.dataset.kgToggleState).toBe('open');
		expect(button.getAttribute('aria-expanded')).toBe('true');
		// A click on the icon, or anywhere on the heading, toggles too.
		(icon as HTMLElement).click();
		expect(card.dataset.kgToggleState).toBe('close');
		expect(button.getAttribute('aria-expanded')).toBe('false');
		card.querySelector<HTMLElement>('.kg-toggle-heading')!.click();
		expect(card.dataset.kgToggleState).toBe('open');
		undo?.();
	});

	it('keeps an existing content id, and treats a card without a state as open', () => {
		const el = article(
			TOGGLE.replace(' data-kg-toggle-state="close"', '').replace(
				'class="kg-toggle-content"',
				'class="kg-toggle-content" id="returns"'
			)
		);
		const undo = ghostCards(el);
		const button = el.querySelector('.kg-toggle-heading-text > button')!;
		expect(button.getAttribute('aria-controls')).toBe('returns');
		expect(button.getAttribute('aria-expanded')).toBe('true');
		undo?.();
		expect(el.querySelector('#returns')).not.toBeNull();
	});
});

describe('ghostCards: media, galleries, embeds and ratings', () => {
	it('gives audio and video the browser controls and leaves ones that had them', () => {
		const el = article(MEDIA);
		const undo = ghostCards(el);
		const media = [...el.querySelectorAll('audio, video')];
		expect(media.map((m) => m.hasAttribute('controls'))).toEqual([true, true, true]);
		undo?.();
		expect(media.map((m) => m.hasAttribute('controls'))).toEqual([false, false, true]);
	});

	it("sets each gallery image's share of the row from its width and height", () => {
		const el = article(GALLERY);
		const undo = ghostCards(el);
		const cells = [...el.querySelectorAll<HTMLElement>('.kg-gallery-image')];
		expect(cells.map((c) => c.style.getPropertyValue('--ds-ghost-share'))).toEqual([
			'1.5',
			'0.6667',
			''
		]);
		undo?.();
		expect(cells.map((c) => c.style.getPropertyValue('--ds-ghost-share'))).toEqual(['', '', '']);
	});

	it("sets an embed's aspect ratio from pixel attributes only", () => {
		const el = article(EMBEDS);
		const undo = ghostCards(el);
		const [player, podcast] = [...el.querySelectorAll('iframe')];
		expect(player.style.getPropertyValue('--ds-ghost-ratio')).toBe('560 / 315');
		expect(podcast.style.getPropertyValue('--ds-ghost-ratio')).toBe('');
		undo?.();
		expect(player.style.getPropertyValue('--ds-ghost-ratio')).toBe('');
	});

	it('names a product rating as one image, in the strings', () => {
		const el = article(PRODUCT);
		const undo = ghostCards(el);
		const rating = el.querySelector('.kg-product-card-rating')!;
		expect(rating.getAttribute('role')).toBe('img');
		expect(rating.getAttribute('aria-label')).toBe('3 of 5 stars');
		undo?.();
		expect(rating.hasAttribute('role')).toBe(false);
		setStrings({ stars: (n, max) => `${n}/${max}` });
		ghostCards(el);
		expect(rating.getAttribute('aria-label')).toBe('3/5');
	});
});

describe('ghostCards: author colors', () => {
	it("drops the editor's inline colors, keeping a dark or light ground as the tone", () => {
		const el = article(COLORED);
		const undo = ghostCards(el);
		const [header, signup] = [
			...el.querySelectorAll<HTMLElement>('.kg-header-card, .kg-signup-card')
		];
		expect(header.dataset.dsTone).toBe('dark');
		expect(header.style.backgroundColor).toBe('');
		expect(el.querySelector<HTMLElement>('.kg-header-card-heading')!.style.color).toBe('');
		const button = el.querySelector<HTMLElement>('.kg-header-card-button')!;
		expect([button.style.color, button.style.backgroundColor]).toEqual(['', '']);
		expect(signup.dataset.dsTone).toBe('light');
		expect(signup.style.backgroundColor).toBe('');
		// The signup card stays as hidden as Ghost rendered it: showing it is the site's wiring.
		expect(signup.style.display).toBe('none');
		undo?.();
		expect(header.hasAttribute('data-ds-tone')).toBe(false);
		expect(header.style.backgroundColor).not.toBe('');
		expect(button.style.color).not.toBe('');
	});

	it('keeps them with authorColors', () => {
		const el = article(COLORED);
		const undo = ghostCards({ authorColors: true })(el) as (() => void) | undefined;
		const header = el.querySelector<HTMLElement>('.kg-header-card')!;
		expect(header.style.backgroundColor).not.toBe('');
		expect(header.hasAttribute('data-ds-tone')).toBe(false);
		undo?.();
	});
});

describe('ghostCards: lifecycle', () => {
	const ALL = TOGGLE + MEDIA + GALLERY + EMBEDS + COLORED + PRODUCT;

	it('is idempotent, and puts the markup back exactly as it was', () => {
		const el = article(ALL);
		const before = el.innerHTML;
		const first = ghostCards(el);
		const enhancedOnce = el.innerHTML;
		const second = ghostCards(el);
		expect(el.innerHTML).toBe(enhancedOnce);
		expect(el.querySelectorAll('.kg-toggle-heading-text > button')).toHaveLength(1);
		second?.();
		first?.();
		expect(el.innerHTML).toBe(before);
	});

	it('re-runs cleanly: attach, detach, attach', () => {
		const el = article(TOGGLE);
		ghostCards(el)?.();
		const undo = ghostCards(el);
		expect(el.querySelectorAll('.kg-toggle-heading-text > button')).toHaveLength(1);
		el.querySelector<HTMLElement>('.kg-toggle-heading-text > button')!.click();
		expect(el.querySelector<HTMLElement>('.kg-toggle-card')!.dataset.kgToggleState).toBe('open');
		undo?.();
		// The state the post was written with comes back.
		expect(el.querySelector<HTMLElement>('.kg-toggle-card')!.dataset.kgToggleState).toBe('close');
	});

	it('enhances content replaced later, and lets go of content removed', async () => {
		const el = article('<p>Loading</p>');
		const undo = ghostCards(el);
		el.innerHTML = TOGGLE + MEDIA;
		await flush();
		const button = el.querySelector<HTMLElement>('.kg-toggle-heading-text > button');
		expect(button).not.toBeNull();
		expect(el.querySelector('audio')!.hasAttribute('controls')).toBe(true);
		const old = el.querySelector<HTMLElement>('.kg-toggle-card')!;
		el.innerHTML = TOGGLE;
		await flush();
		expect(el.querySelectorAll('.kg-toggle-heading-text > button')).toHaveLength(1);
		// The removed card's listener is gone with its enhancement.
		expect(old.hasAttribute('data-ds-toggle')).toBe(false);
		undo?.();
		el.innerHTML = TOGGLE;
		await flush();
		expect(el.querySelector('.kg-toggle-heading-text > button')).toBeNull();
	});

	it('does nothing without a document (server rendering)', () => {
		const el = article(TOGGLE);
		vi.stubGlobal('document', undefined);
		expect(() => ghostCards(el)).not.toThrow();
		expect(ghostCards(el)).toBeUndefined();
		expect(ghostCards({ authorColors: true })(el)).toBeUndefined();
		vi.unstubAllGlobals();
		expect(el.querySelector('.kg-toggle-heading-text > button')).toBeNull();
	});
});
