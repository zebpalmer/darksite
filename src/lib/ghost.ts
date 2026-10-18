// The small amount of behavior a Ghost CMS post's cards need, as an attachment, for a site that
// renders the post headlessly (its HTML from Ghost's Content API, without Ghost's own card script):
//
//   <article class="ds-article ds-article-ghost" {@attach ghostCards}>
//     <header>…</header>
//     {@html post.html}
//   </article>
//
//   <article class="ds-article ds-article-ghost" {@attach ghostCards({ authorColors: true })}>
//
// It does, once per card:
// - Toggle cards: the heading's text becomes a disclosure button (`aria-expanded`, `aria-controls`)
//   that opens and closes the card through Ghost's `data-kg-toggle-state`. Without the script a
//   toggle stays open: base.css hides closed content only on a card this attachment has enhanced.
// - Audio and video cards: the media element gets the browser's own controls. Ghost's custom
//   player, which needs Ghost's script, is hidden by base.css with or without this.
// - Galleries: each image's share of its row from its width and height (`--ds-ghost-share`), so a
//   row shows every image whole at one height. Without it the images take equal shares.
// - Embeds: an iframe's aspect ratio from its width and height (`--ds-ghost-ratio`); 16:9 without.
// - Product ratings: the stars are named as one image ("4 of 5 stars", from `strings`).
// - Header (v2), signup and call-to-action cards: the colors Ghost's editor writes inline are
//   dropped, so the cards take darksite's roles in every mode. A card's light or dark background
//   is kept as its tone (`data-ds-tone`). `authorColors: true` keeps the editor's colors instead.
//
// It never submits a signup form or reveals one Ghost rendered hidden (`style="display: none"`):
// that is the site's own wiring. It watches the article, so content replaced later is enhanced too,
// and undoes everything when it is removed. It does nothing on the server.
import type { Attachment } from 'svelte/attachments';

import { strings } from './strings.svelte.js';

export interface GhostCardsOptions {
	/** Keep the colors an author picked in Ghost's editor (header v2, signup and call-to-action
	 *  cards), which win over darksite's roles. Default false. */
	authorColors?: boolean;
}

type Undo = () => void;

// Every node an attachment has enhanced, shared by all of them: a second attachment on the same
// article, or on an ancestor, leaves a card alone.
const enhanced = new WeakSet<Element>();
let seq = 0;

/** The attachment, with the default options: `<article … {@attach ghostCards}>`. */
export function ghostCards(article: HTMLElement): Undo | undefined;
/** The attachment with options: `<article … {@attach ghostCards({ authorColors: true })}>`. */
export function ghostCards(options?: GhostCardsOptions): Attachment<HTMLElement>;
export function ghostCards(
	arg?: HTMLElement | GhostCardsOptions
): Undo | undefined | Attachment<HTMLElement> {
	if (arg && (arg as Node).nodeType === 1) return attach(arg as HTMLElement, {});
	const options = { ...(arg as GhostCardsOptions | undefined) };
	return (article) => attach(article, options);
}

function attach(article: HTMLElement, options: GhostCardsOptions): Undo | undefined {
	if (typeof document === 'undefined') return;
	const undos = new Map<Element, Undo>();

	const once = <E extends Element>(nodes: Iterable<E>, enhance: (node: E) => Undo | void) => {
		for (const node of nodes) {
			if (enhanced.has(node)) continue;
			const undo = enhance(node);
			if (!undo) continue;
			enhanced.add(node);
			undos.set(node, () => {
				enhanced.delete(node);
				undo();
			});
		}
	};

	const scan = () => {
		// A card that left the article (its content was replaced) lets go of its listeners.
		for (const [node, undo] of undos)
			if (!article.contains(node)) {
				undo();
				undos.delete(node);
			}
		const all = <E extends Element>(selector: string) => article.querySelectorAll<E>(selector);
		once(all<HTMLElement>('.kg-toggle-card'), toggle);
		once(all<HTMLMediaElement>('.kg-audio-card audio, .kg-video-card video'), controls);
		once(all<HTMLImageElement>('.kg-gallery-image img'), share);
		once(all<HTMLIFrameElement>('.kg-embed-card > iframe'), ratio);
		once(all<HTMLElement>('.kg-product-card-rating'), rating);
		if (!options.authorColors)
			once(all<HTMLElement>('.kg-header-card.kg-v2, .kg-signup-card, .kg-cta-card'), themeColors);
	};

	scan();
	const observer =
		typeof MutationObserver === 'undefined'
			? null
			: new MutationObserver(() => {
					scan();
					// The scan's own changes need no second look.
					observer?.takeRecords();
				});
	observer?.observe(article, { childList: true, subtree: true });

	return () => {
		observer?.disconnect();
		for (const undo of undos.values()) undo();
		undos.clear();
	};
}

/** Remember attributes, to put them back as they were. */
function keep(el: Element, names: string[]): Undo {
	const before = names.map((name) => [name, el.getAttribute(name)] as const);
	return () => {
		for (const [name, value] of before)
			if (value === null) el.removeAttribute(name);
			else el.setAttribute(name, value);
	};
}

/** A positive number of pixels from an attribute (`width="560"`), or null (`width="100%"`). */
function pixels(el: Element, name: string): number | null {
	const raw = el.getAttribute(name)?.trim();
	if (!raw || !/^\d+(\.\d+)?(px)?$/.test(raw)) return null;
	const n = parseFloat(raw);
	return n > 0 ? n : null;
}

function toggle(card: HTMLElement): Undo | void {
	const heading = card.querySelector<HTMLElement>(':scope > .kg-toggle-heading');
	const content = card.querySelector<HTMLElement>(':scope > .kg-toggle-content');
	if (!heading || !content) return;
	const text = heading.querySelector<HTMLElement>('.kg-toggle-heading-text') ?? heading;
	const icon = heading.querySelector<HTMLElement>('.kg-toggle-card-icon');
	const restore = [
		keep(card, ['data-kg-toggle-state', 'data-ds-toggle']),
		keep(content, ['id']),
		...(icon ? [keep(icon, ['tabindex', 'aria-hidden'])] : [])
	];

	// The heading's text goes inside a button, so its name is the heading and the heading stays a
	// heading. Ghost's icon button stays as the picture of the state, out of the tab order.
	const button = document.createElement('button');
	button.type = 'button';
	button.append(...text.childNodes);
	text.append(button);
	if (!content.id) content.id = `ds-ghost-toggle-${++seq}`;
	button.setAttribute('aria-controls', content.id);
	icon?.setAttribute('tabindex', '-1');
	icon?.setAttribute('aria-hidden', 'true');

	const isOpen = () => card.getAttribute('data-kg-toggle-state') !== 'close';
	const sync = () => button.setAttribute('aria-expanded', String(isOpen()));
	// A click anywhere on the heading toggles, as Ghost's does; Enter and Space reach the button.
	const onclick = () => {
		card.setAttribute('data-kg-toggle-state', isOpen() ? 'close' : 'open');
		sync();
	};
	sync();
	card.setAttribute('data-ds-toggle', '');
	heading.addEventListener('click', onclick);

	return () => {
		heading.removeEventListener('click', onclick);
		text.append(...button.childNodes);
		button.remove();
		for (const undo of restore) undo();
	};
}

function controls(media: HTMLMediaElement): Undo | void {
	if (media.hasAttribute('controls')) return;
	media.setAttribute('controls', '');
	return () => media.removeAttribute('controls');
}

/** Set a custom property inline, and take it back without leaving an empty `style` behind. */
function setVar(el: HTMLElement, name: string, value: string): Undo {
	const hadStyle = el.hasAttribute('style');
	const before = el.style.getPropertyValue(name);
	el.style.setProperty(name, value);
	return () => {
		if (before) el.style.setProperty(name, before);
		else el.style.removeProperty(name);
		if (!hadStyle && !el.getAttribute('style')?.trim()) el.removeAttribute('style');
	};
}

function share(img: HTMLImageElement): Undo | void {
	const cell = img.closest<HTMLElement>('.kg-gallery-image');
	const w = pixels(img, 'width');
	const h = pixels(img, 'height');
	if (!cell || !w || !h) return;
	return setVar(cell, '--ds-ghost-share', String(Math.round((w / h) * 10000) / 10000));
}

function ratio(frame: HTMLIFrameElement): Undo | void {
	const w = pixels(frame, 'width');
	const h = pixels(frame, 'height');
	if (!w || !h) return;
	return setVar(frame, '--ds-ghost-ratio', `${w} / ${h}`);
}

function rating(stars: HTMLElement): Undo | void {
	const total = stars.querySelectorAll('.kg-product-card-rating-star').length;
	if (!total) return;
	const on = stars.querySelectorAll('.kg-product-card-rating-active').length;
	const restore = keep(stars, ['role', 'aria-label']);
	stars.setAttribute('role', 'img');
	stars.setAttribute('aria-label', strings.stars(on, total));
	return restore;
}

/** Light or dark, from a CSS color as the browser reports it (`rgb(240, 240, 240)`). */
function tone(color: string): 'light' | 'dark' | null {
	let rgb: number[] | null = null;
	const fn = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(
		color.trim()
	);
	if (fn) {
		const alpha = fn[4] === undefined ? 1 : parseFloat(fn[4]) / (fn[4].endsWith('%') ? 100 : 1);
		if (alpha < 0.5) return null;
		rgb = [fn[1], fn[2], fn[3]].map(Number);
	} else {
		const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color.trim())?.[1];
		if (hex) {
			const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
			rgb = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
		}
	}
	if (!rgb) return null;
	const [r, g, b] = rgb.map((c) => {
		const s = c / 255;
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	// Below 0.18 (a mid gray) light text reads better than dark: a dark ground.
	return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.18 ? 'dark' : 'light';
}

function themeColors(card: HTMLElement): Undo | void {
	const styled = [card, ...card.querySelectorAll<HTMLElement>('[style]')].filter((el) =>
		el.hasAttribute('style')
	);
	const restore = [keep(card, ['data-ds-tone']), ...styled.map((el) => keep(el, ['style']))];
	const t = tone(card.style.backgroundColor);
	if (t) card.setAttribute('data-ds-tone', t);
	for (const el of styled) {
		el.style.removeProperty('color');
		el.style.removeProperty('background-color');
	}
	return () => {
		for (const undo of restore) undo();
	};
}
