// The brand generator (brand/*.mjs) and the prebuilt brands.
import { describe, expect, it } from 'vitest';
import tokens from '../../tokens.json';
import { contrast, fromOklch, oklch } from '../../brand/color.mjs';
import { brandCss, generateBrand } from '../../brand/generate.mjs';
import { presets } from '../../brand/presets.mjs';

describe('color math', () => {
	it('round-trips hex through OKLCH', () => {
		for (const hex of [
			'#9184d9',
			'#161826',
			'#e9e9ed',
			'#2e3440',
			'#ff5555',
			'#00ff00',
			'#000000',
			'#ffffff'
		])
			expect(fromOklch(oklch(hex))).toBe(hex);
	});

	it('computes WCAG contrast', () => {
		expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
		expect(contrast('#e9e9ed', '#161826')).toBeCloseTo(14.54, 1);
	});
});

describe('generateBrand', () => {
	it('builds every prebuilt brand with every contrast pair passing', () => {
		for (const p of presets) expect(generateBrand(tokens, p).failures, p.name).toEqual([]);
	});

	it('puts a single accent exactly into the dark modes and derives the light ones', () => {
		const g = generateBrand(tokens, { name: 'x', accent: '#2bb3a8' });
		expect(g.resolve('dark')('ds-accent')).toBe('#2bb3a8');
		expect(g.resolve('night')('ds-accent')).toBe('#2bb3a8');
		const light = oklch(g.resolve('light')('ds-accent'));
		expect(Math.abs(light.h - oklch('#2bb3a8').h)).toBeLessThan(8);
		expect(light.l).toBeLessThan(oklch('#2bb3a8').l);
	});

	it('changes nothing for an empty brand', () => {
		const g = generateBrand(tokens, { name: 'none' });
		for (const m of Object.values(g.modes)) expect(m).toEqual({});
	});

	it('nudges a color that misses its target and reports it', () => {
		const g = generateBrand(tokens, {
			name: 'pale',
			accent: { dark: '#2bb3a8', light: '#ffd600' }
		});
		expect(g.failures).toEqual([]);
		expect(g.notes.some((n) => n.startsWith('light: ds-accent'))).toBe(true);
	});

	it('gives the rail its own grounds, text and accent', () => {
		const g = generateBrand(tokens, { name: 'r', accent: '#d6728f', chrome: { rail: '#3b1d2a' } });
		const v = g.resolve('light');
		expect(v('ds-rail-bg-0')).toBe('#3b1d2a');
		expect(contrast(v('ds-rail-text-1'), v('ds-rail-bg-0'))).toBeGreaterThanOrEqual(4.5);
	});

	it('locks roles the brand sets exactly', () => {
		const g = generateBrand(tokens, { name: 'l', roles: { dark: { 'ds-bg-1': '#101010' } } });
		expect(g.resolve('dark')('ds-bg-1')).toBe('#101010');
	});

	it('writes scoped CSS for every mode, on the root and below it', () => {
		const css = brandCss(
			tokens,
			generateBrand(tokens, { name: 'teal', accent: '#2bb3a8' }),
			':root[data-brand="teal"]'
		);
		expect(css).toContain(':root[data-brand="teal"],');
		expect(css).toContain(':root[data-brand="teal"] [data-ds-theme="paper"]');
		expect(css).toContain(':root[data-brand="teal"][data-theme="night"]:not([data-ds-theme])');
		expect(css).toContain('@media (prefers-color-scheme: light)');
		expect(css).toContain('--ds-accent: #2bb3a8;');
	});
});
