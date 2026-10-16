// The brand generator: from a few inputs — an accent, a gray tint, surfaces, chrome colors, fonts —
// to the CSS that re-colors darksite in every mode, with every documented contrast pair checked
// and nudged until it passes. Hand overrides of `--ds-*` miss the roles a color drives (hover,
// text, tint, focus, the label on a fill) and the modes; this does all of them.
import { contrastOn, fromOklch, luminance, oklch, parse } from './color.mjs';
import { buildPairs, evaluate } from './contrast.mjs';

const DARK_FAMILY = new Set(['dark', 'night', 'contrast']);
// Reading modes keep their warm grounds whatever the brand: only its colors and fonts reach them.
const READING = new Set(['paper', 'night']);

const ACCENT = ['ds-accent', 'ds-accent-strong', 'ds-accent-text', 'ds-accent-key', 'ds-focus'];
const ACCENT_TINTS = [
	'ds-accent-tint',
	'ds-accent-tint-hover',
	'ds-accent-mixed',
	'ds-accent-key-edge'
];
const ACCENT_2 = ['ds-accent-2', 'ds-accent-2-text'];
const ACCENT_2_TINTS = ['ds-accent-2-tint'];
const SEMANTIC = {
	success: {
		anchor: 'ds-success',
		fills: ['ds-success', 'ds-success-text', 'ds-sev-low', 'ds-sev-low-ink'],
		tints: ['ds-success-tint', 'ds-sev-low-bg']
	},
	warning: {
		anchor: 'ds-warning',
		fills: ['ds-warning', 'ds-warning-text', 'ds-sev-medium', 'ds-sev-medium-ink'],
		tints: ['ds-warning-tint', 'ds-sev-medium-bg']
	},
	danger: {
		anchor: 'ds-danger',
		fills: [
			'ds-danger',
			'ds-danger-fill',
			'ds-danger-text',
			'ds-danger-strong',
			'ds-sev-high',
			'ds-sev-high-ink'
		],
		tints: ['ds-danger-tint', 'ds-sev-high-bg']
	}
};
const GROUNDS = [
	'ds-bg-0',
	'ds-bg-1',
	'ds-bg-2',
	'ds-bg-3',
	'ds-bg-4',
	'ds-bg-5',
	'ds-text-inverse'
];
const EDGES = ['ds-border-subtle', 'ds-border', 'ds-border-strong', 'ds-sev-off'];
const TEXTS = ['ds-text-1', 'ds-text-2', 'ds-text-3'];
const TINTS = [
	...ACCENT_TINTS,
	...ACCENT_2_TINTS,
	...Object.values(SEMANTIC).flatMap((s) => s.tints)
];
const CHROME_ROLES = (x) => [
	...[0, 1, 2, 3, 4, 5].map((i) => [`ds-${x}-bg-${i}`, `ds-bg-${i}`]),
	...[1, 2, 3].map((i) => [`ds-${x}-text-${i}`, `ds-text-${i}`]),
	...['border-subtle', 'border', 'border-strong'].map((b) => [`ds-${x}-${b}`, `ds-${b}`])
];

const isAlias = (v) => typeof v === 'string' && /^\{(.+)\}$/.test(v);
const aliasOf = (v) => /^\{(.+)\}$/.exec(v)[1];
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/** A brand value for one mode. A string is the color in the dark modes; the light modes take its
 *  hue and chroma at their own lightness. An object names modes, and a mode it leaves out takes its
 *  family's (dark for night and contrast, light for paper). */
function pick(value, mode) {
	if (value === undefined || value === null) return undefined;
	// High contrast keeps its own, lighter, values unless the brand names it.
	if (typeof value === 'string')
		return { color: value, exact: DARK_FAMILY.has(mode) && mode !== 'contrast' };
	if (value[mode]) return { color: value[mode], exact: true };
	const family = DARK_FAMILY.has(mode) ? 'dark' : 'light';
	if (value[family])
		return {
			color: value[family],
			exact: family === mode || (mode === 'night' && family === 'dark')
		};
	const other = value.dark ?? value.light;
	return other ? { color: other, exact: false } : undefined;
}

/** Lightness remapped so `from` lands on `to`, 0 and 1 stay put, and order and spacing above and
 *  below are kept in proportion: a much lighter brand color does not push its lighter roles to
 *  white. */
const remapL = (l, { from, to }) =>
	l <= from
		? from > 0
			? (l * to) / from
			: to
		: to + ((l - from) * (1 - to)) / Math.max(1e-6, 1 - from);

/** Move a color toward a new hue and chroma, and shift (`dl`) or remap (`remap`) its lightness. */
function shift(hex, { dl = 0, remap, hue, chroma = 1, setChroma }) {
	const o = oklch(hex);
	return fromOklch({
		l: clamp(remap ? remapL(o.l, remap) : o.l + dl, 0, 1),
		c: setChroma ?? o.c * chroma,
		h: hue ?? o.h
	});
}

const ratioOf = (from, to) => (from.c > 0.012 ? to.c / from.c : undefined);

export function themesOf(tokens) {
	return tokens.color.themes;
}

/** The raw value of every token in one mode, ramps resolved, role-to-role aliases kept. */
function rawValues(tokens, theme) {
	const themes = tokens.color.themes;
	const first = themes[0].id;
	const base = themes.find((t) => t.id === theme)?.extends;
	const all = [...tokens.color.tokens, ...(tokens.shadow?.tokens ?? [])];
	const byName = Object.fromEntries(all.map((t) => [t.name, t.value]));
	const raw = (name) => {
		const v = byName[name];
		return typeof v === 'string' ? v : (v[theme] ?? (base ? v[base] : undefined) ?? v[first]);
	};
	const out = {};
	for (const t of all) {
		let v = raw(t.name);
		for (let i = 0; i < 16 && isAlias(v) && aliasOf(v).startsWith('color-'); i++)
			v = raw(aliasOf(v));
		out[t.name] = v;
	}
	return out;
}

function resolver(values) {
	return function value(name, depth = 0) {
		const v = values[name];
		if (v === undefined) throw new Error(`unknown role ${name}`);
		return isAlias(v) && depth < 16 ? value(aliasOf(v), depth + 1) : v;
	};
}

/**
 * Generate one brand. Returns { name, modes: { [mode]: { role: value } } (only the roles the brand
 * changes, in every mode), fonts, notes (each nudge the solver made), failures }.
 */
export function generateBrand(tokens, brand) {
	const themes = tokens.color.themes;
	const pairs = buildPairs();
	const base = Object.fromEntries(themes.map((t) => [t.id, rawValues(tokens, t.id)]));
	const out = {};
	const notes = [];
	const failures = [];
	const locked = {};

	for (const { id: mode } of themes) {
		const family = DARK_FAMILY.has(mode) ? 'dark' : 'light';
		const v = { ...base[mode] };
		const value = resolver(v);
		const locks = new Set();

		// Grounds, edges and text: a gray tint, or explicit surfaces (a page color, a text color).
		const surface = READING.has(mode)
			? brand.surfaces?.[mode]
			: (brand.surfaces?.[mode] ?? brand.surfaces?.[family]);
		const neutral = READING.has(mode) && !brand.surfaces?.[mode] ? undefined : brand.neutral;
		let groundShift;
		if (surface?.bg) {
			const from = oklch(value('ds-bg-1'));
			const to = oklch(surface.bg);
			groundShift = {
				dl: to.l - from.l,
				hue: to.h,
				chroma: ratioOf(from, to) ?? 1,
				setChroma: ratioOf(from, to) === undefined ? to.c : undefined
			};
		} else if (neutral) {
			groundShift = { hue: neutral.hue, chroma: neutral.chroma ?? 1 };
		}
		if (groundShift) {
			for (const r of [...GROUNDS, ...EDGES]) v[r] = shift(value(r), groundShift);
			for (const r of TINTS) v[r] = shift(value(r), { dl: groundShift.dl ?? 0 });
			let textShift = {
				hue: groundShift.hue,
				chroma: groundShift.chroma,
				setChroma: groundShift.setChroma
			};
			if (surface?.text) {
				const from = oklch(value('ds-text-1'));
				const to = oklch(surface.text);
				textShift = { dl: to.l - from.l, hue: to.h, setChroma: to.c };
			}
			for (const r of TEXTS) v[r] = shift(value(r), textShift);
			for (const s of ['ds-scrim']) {
				const [r, g, b, a] = parse(value(s));
				const tinted = parse(
					shift(`#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`, {
						hue: groundShift.hue,
						chroma: groundShift.chroma ?? 1
					})
				);
				v[s] = `rgba(${tinted[0]}, ${tinted[1]}, ${tinted[2]}, ${a})`;
			}
		}

		// A color family moved to a brand color: hue and chroma from the color, lightness shifted by
		// how far the color sits from the role it replaces (in its own mode; a mode that borrows
		// another's color keeps its own lightness).
		const recolor = (input, anchor, fills, tints) => {
			const p = pick(input, mode);
			if (!p) return;
			const from = oklch(value(anchor));
			const to = oklch(p.color);
			const remap = p.exact ? { from: from.l, to: to.l } : undefined;
			const chroma = ratioOf(from, to);
			const t = {
				hue: to.h,
				chroma: chroma ?? 1,
				setChroma: chroma === undefined ? to.c : undefined
			};
			for (const r of fills) v[r] = shift(value(r), { ...t, remap });
			for (const r of tints) v[r] = shift(value(r), t);
		};
		recolor(brand.accent, 'ds-accent', ACCENT, ACCENT_TINTS);
		recolor(brand.accent2, 'ds-accent-2', ACCENT_2, ACCENT_2_TINTS);
		for (const [key, s] of Object.entries(SEMANTIC))
			recolor(brand[key], s.anchor, s.fills, s.tints);

		// Exact roles the brand sets itself: never nudged.
		for (const [r, x] of Object.entries(brand.roles?.[mode] ?? {})) {
			v[r] = x;
			locks.add(r);
		}

		// The shadows carry ground and edge colors; follow them.
		const swap = new Map();
		for (const r of [...GROUNDS, ...EDGES, ...ACCENT]) {
			const was = resolver(base[mode])(r);
			if (typeof was === 'string' && was.startsWith('#') && value(r) !== was)
				swap.set(was.toLowerCase(), value(r));
		}
		for (const s of ['ds-elev-1', 'ds-elev-2', 'ds-elev-3', 'ds-focus-ring'])
			v[s] = String(v[s]).replace(/#[0-9a-f]{6}/gi, (h) => swap.get(h.toLowerCase()) ?? h);

		out[mode] = { v, locks };
		locked[mode] = locks;
	}

	// The chrome: a rail or bar color makes a small set of grounds, text and edges of its own,
	// shaped like the dark or light page roles depending on how dark the color is.
	for (const x of ['rail', 'bar']) {
		for (const { id: mode } of themes) {
			const p = pick(brand.chrome?.[x], mode);
			if (!p) continue;
			const { v } = out[mode];
			const g = oklch(p.color);
			const fam = g.l < 0.6 ? 'dark' : 'light';
			const tpl = resolver(out[fam].v);
			const anchor = oklch(tpl(x === 'rail' ? 'ds-bg-0' : 'ds-bg-2'));
			const dl = g.l - anchor.l;
			const chroma = ratioOf(anchor, g);
			const ground = {
				dl,
				hue: g.h,
				chroma: chroma ?? 1,
				setChroma: chroma === undefined ? g.c : undefined
			};
			for (const [role, from] of CHROME_ROLES(x)) {
				if (from.startsWith('ds-text'))
					v[role] = shift(tpl(from), { hue: g.h, chroma: Math.min(1, chroma ?? 1) });
				else v[role] = shift(tpl(from), ground);
			}
			const accent = tpl('ds-accent');
			const text1 = v[`ds-${x}-text-1`];
			v[`ds-${x}-accent`] = contrastOn(accent, v[`ds-${x}-bg-0`]) >= 3 ? accent : text1;
			const accentText = tpl('ds-accent-text');
			v[`ds-${x}-accent-text`] =
				contrastOn(accentText, v[`ds-${x}-bg-2`]) >= 4.5 ? accentText : text1;
		}
	}

	// The solver: every documented pair, in every mode. A foreground that falls short moves away
	// from its ground in lightness until it passes; a locked role never moves.
	const result = {};
	for (const { id: mode, extends: ext } of themes) {
		const family = ext ?? (mode === themes[0].id ? mode : 'light');
		const { v, locks } = out[mode];
		const value = resolver(v);
		// The label on a filled accent follows the mode, as in the default theme: dark on the light
		// fills of a dark mode, light on the dark fills of a light mode (where the same fill also has to
		// read as text on the page, which only a dark color can). The solver then moves the fills one
		// way: lighter in a dark mode, darker in a light one.
		const pickLabel = () => {
			if (!brand.accent || locks.has('ds-accent-contrast')) return;
			v['ds-accent-contrast'] = value('ds-text-inverse');
		};
		for (let pass = 0; pass < 16; pass++) {
			pickLabel();
			let moved = false;
			for (const r of evaluate(pairs, value, mode, family)) {
				if (r.ok || r.shortfall) continue;
				// An alias moves the role it points at (the rail's accent is the accent).
				let role = r.fg;
				for (let i = 0; i < 16 && isAlias(v[role]); i++) role = aliasOf(v[role]);
				if (locks.has(role)) continue;
				const fg = value(role);
				if (!fg.startsWith('#')) continue;
				const lighter =
					luminance(fg) >= luminance(value(r.bg).startsWith('#') ? value(r.bg) : '#000000');
				let next = fg;
				for (let i = 0; i < 120 && contrastOn(next, value(r.bg)) < r.need; i++)
					next = shift(next, { dl: lighter ? 0.004 : -0.004 });
				if (next !== fg) {
					notes.push(`${mode}: ${role} ${fg} → ${next} (${r.why}, on ${r.bg})`);
					v[role] = next;
					moved = true;
				}
				// A label already at black or white cannot go further: move its fill instead (never a
				// page ground).
				if (contrastOn(value(role), value(r.bg)) < r.need) {
					let ground = r.bg;
					for (let i = 0; i < 16 && isAlias(v[ground]); i++) ground = aliasOf(v[ground]);
					const bg = value(ground);
					// Never a page ground, and never the chrome color the brand chose (rail bg-0, bar bg-2).
					if (
						locks.has(ground) ||
						/^ds-bg-|^ds-rail-bg-0$|^ds-bar-bg-2$/.test(ground) ||
						!bg.startsWith('#')
					)
						continue;
					let nextBg = bg;
					for (let i = 0; i < 120 && contrastOn(value(role), nextBg) < r.need; i++)
						nextBg = shift(nextBg, { dl: lighter ? -0.004 : 0.004 });
					if (nextBg !== bg) {
						notes.push(`${mode}: ${ground} ${bg} → ${nextBg} (${r.why}, under ${role})`);
						v[ground] = nextBg;
						moved = true;
					}
				}
			}
			if (!moved) break;
		}
		for (const r of evaluate(pairs, value, mode, family))
			if (!r.ok && !r.shortfall)
				failures.push(
					`${mode}: ${r.fg} on ${r.bg} is ${r.ratio.toFixed(2)}, needs ${r.need} (${r.why})`
				);

		const changed = {};
		const was = base[mode];
		for (const [role, x] of Object.entries(v)) if (x !== was[role]) changed[role] = x;
		result[mode] = changed;
	}

	// Every block names every role the brand touches in any mode, so a mode chosen on part of the
	// page never inherits another mode's brand value.
	const touched = new Set(Object.values(result).flatMap((m) => Object.keys(m)));
	const modes = {};
	for (const { id: mode } of themes) {
		const value = resolver(out[mode].v);
		modes[mode] = Object.fromEntries(
			[...touched].sort().map((r) => [r, isAlias(out[mode].v[r]) ? out[mode].v[r] : value(r)])
		);
	}
	return {
		name: brand.name,
		modes,
		fonts: brand.fonts ?? {},
		notes,
		failures,
		resolve: (mode) => resolver(out[mode].v)
	};
}

/** The CSS for a generated brand. `scope` is the root selector: `:root` (the whole app) by
 *  default, or `:root[data-brand="name"]` so several brands can live side by side. */
export function brandCss(tokens, generated, scope = ':root') {
	const themes = tokens.color.themes;
	const ids = themes.map((t) => t.id);
	const [first] = ids;
	const explicit = (id) => [`[data-theme="${id}"]:not([data-ds-theme])`, `[data-ds-theme="${id}"]`];
	const both = (sel) => [`${scope}${sel}`, `${scope} ${sel}`];
	const ref = (x) => (isAlias(x) ? `var(--${aliasOf(x)})` : x);
	const lines = [
		`/* darksite brand "${generated.name}" — generated by darksite-theme. Do not edit; change the brand and regenerate. */`,
		''
	];
	const block = (selectors, mode, indent = '') => {
		const roles = generated.modes[mode];
		if (!Object.keys(roles).length) return;
		lines.push(`${indent}${selectors.join(`,\n${indent}`)} {`);
		for (const [r, x] of Object.entries(roles)) lines.push(`${indent}  --${r}: ${ref(x)};`);
		lines.push(`${indent}}`, '');
	};
	block([scope, ...explicit(first).flatMap(both)], first);
	for (const id of ids.slice(1)) block(explicit(id).flatMap(both), id);
	for (const t of themes.filter((x) => x.media)) {
		const unchosen = `${scope}:not([data-ds-theme])${ids.map((id) => `:not([data-theme="${id}"])`).join('')}`;
		const sel = [unchosen, ...(t.extends ? explicit(t.extends).flatMap(both) : [])];
		if (!Object.keys(generated.modes[t.id]).length) continue;
		lines.push(`@media ${t.media} {`);
		block(sel, t.id, '  ');
		lines.push('}', '');
	}
	const fonts = Object.entries(generated.fonts).filter(([, x]) => x);
	if (fonts.length) {
		lines.push(`${scope} {`);
		for (const [k, x] of fonts) lines.push(`  --font-${k}: ${x};`);
		lines.push('}', '');
	}
	return lines.join('\n');
}
