import { describe, expect, it } from 'vitest';
import tokens from '../../tokens.json';
import css from './tokens.css?raw';
import base from './base.css?raw';

/** Top-level and media-nested rule heads, in source order, with their declarations. */
function rules(source: string) {
	const out: { media: string | null; selectors: string[]; body: string }[] = [];
	const re = /(@media [^{]+)\{|([^{}@]+)\{([^{}]*)\}|\}/g;
	let media: string | null = null;
	for (const m of source.matchAll(re)) {
		if (m[1]) media = m[1].trim();
		else if (m[2] !== undefined)
			out.push({
				media,
				selectors: m[2]
					.replace(/\/\*[\s\S]*?\*\//g, '')
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean),
				body: m[3]
			});
		else media = null;
	}
	return out;
}

/** Specificity of the simple selectors this file generates: `:root`, attributes, `:not()`. */
function specificity(selector: string) {
	return (selector.match(/:root|\[/g) ?? []).length;
}

const themeIds = tokens.color.themes.map((t) => t.id);
const all = rules(css);
const plain = all.filter((r) => !r.media);
const media = all.filter((r) => r.media);

describe('tokens.css theme selection', () => {
	it('matches every theme through data-theme and data-ds-theme', () => {
		for (const id of themeIds) {
			const rule = plain.find((r) => r.selectors.includes(`[data-ds-theme="${id}"]`));
			expect(rule, id).toBeDefined();
			expect(rule!.selectors).toContain(`[data-theme="${id}"]:not([data-ds-theme])`);
		}
	});

	it('makes dark the :root default', () => {
		const root = plain.find((r) => r.selectors.includes(':root') && r.body.includes('--ds-bg-1'));
		expect(root!.selectors).toContain('[data-ds-theme="dark"]');
		expect(root!.body).toContain('color-scheme: dark;');
	});

	it('sets color-scheme per theme, with high contrast dark', () => {
		const scheme = (id: string) =>
			plain
				.find((r) => r.selectors.includes(`[data-ds-theme="${id}"]`))!
				.body.match(/color-scheme: (\w+);/)![1];
		expect(scheme('dark')).toBe('dark');
		expect(scheme('light')).toBe('light');
		expect(scheme('contrast')).toBe('dark');
	});

	it('follows the system only when no darksite theme is chosen', () => {
		const unchosen = `:root:not([data-ds-theme])${themeIds.map((id) => `:not([data-theme="${id}"])`).join('')}`;
		expect(media.map((r) => r.media)).toEqual([
			'@media (prefers-color-scheme: light)',
			'@media (prefers-contrast: more)'
		]);
		for (const r of media) expect(r.selectors[0]).toBe(unchosen);
	});

	it('ranks prefers-contrast above prefers-color-scheme', () => {
		const [light, contrast] = media;
		// Same specificity, so the later rule — contrast — wins when both media queries match.
		expect(specificity(contrast.selectors[0])).toBe(specificity(light.selectors[0]));
		expect(all.indexOf(contrast)).toBeGreaterThan(all.indexOf(light));
		expect(contrast.body).toContain('color-scheme: dark;');
		expect(light.body).toContain('color-scheme: light;');
	});

	it('upgrades an explicit dark choice to high contrast, and nothing else', () => {
		const [light, contrast] = media;
		expect(contrast.selectors.slice(1)).toEqual([
			'[data-theme="dark"]:not([data-ds-theme])',
			'[data-ds-theme="dark"]'
		]);
		expect(light.selectors).toHaveLength(1);
		// The upgrade comes after the explicit dark rule it overrides, at equal specificity.
		const dark = plain.find((r) => r.selectors.includes('[data-ds-theme="dark"]'))!;
		expect(all.indexOf(contrast)).toBeGreaterThan(all.indexOf(dark));
	});

	it('writes every per-theme role in every theme block', () => {
		const perTheme = [...tokens.color.tokens, ...tokens.shadow.tokens].filter(
			(t) => typeof t.value !== 'string'
		);
		for (const r of all.filter((x) => x.body.includes('color-scheme'))) {
			for (const t of perTheme)
				expect(r.body, `${r.selectors[0]} ${t.name}`).toContain(`--${t.name}:`);
		}
	});
});

describe('z-index tokens', () => {
	it('declares the stacking order', () => {
		const expected = {
			'ds-z-raised': 1,
			'ds-z-sticky': 20,
			'ds-z-topbar': 21,
			'ds-z-tooltip': 50,
			'ds-z-popover': 60,
			'ds-z-toast': 70,
			'ds-z-skip': 90
		};
		for (const [name, value] of Object.entries(expected))
			expect(css).toContain(`--${name}: ${value};`);
	});
});

describe('base.css cascade layer', () => {
	it('puts its rules in ds.base and keeps the focus ring unlayered', () => {
		const layer = base.indexOf('@layer ds.base {');
		const focus = base.indexOf(':focus-visible {');
		expect(layer).toBeGreaterThan(-1);
		expect(base.indexOf('.ds-control {')).toBeGreaterThan(layer);
		// The layer closes before the focus ring and the keyframes.
		const close = base.indexOf('\n}\n', layer);
		expect(focus).toBeGreaterThan(close);
		expect(base.indexOf('@keyframes')).toBeGreaterThan(close);
	});
});
