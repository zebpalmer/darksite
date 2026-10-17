// The color pairs darksite documents, each with its WCAG 2.1 target, shared by the lint check
// (scripts/check-contrast.mjs) and the brand generator, which nudges a brand's colors until every
// pair passes.
import { contrastOn } from './color.mjs';

export const TEXT = { dark: 4.5, light: 4.5, contrast: 7 };
export const MARK = { dark: 3, light: 3, contrast: 3 };
export const SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'];

/** Every documented pair: { fg, bg, target, why }. */
export function buildPairs(severities = SEVERITIES) {
	const bgs = (...n) => n.map((i) => `ds-bg-${i}`);
	const pairs = [];
	const add = (fg, grounds, target, why) =>
		grounds.forEach((bg) => pairs.push({ fg, bg, target, why }));

	add('ds-text-heading', bgs(1, 2, 3, 4, 5), TEXT, 'headings');
	add('ds-text-1', bgs(1, 2, 3, 4, 5), TEXT, 'primary text');
	add('ds-text-2', bgs(1, 2, 3, 4, 5), TEXT, 'secondary text');
	add('ds-text-3', bgs(1, 2, 3), TEXT, 'muted text (ds-text-2 from ds-bg-4 up)');
	add(
		'ds-text-1',
		['ds-accent-tint', 'ds-warning-tint', 'ds-danger-tint', 'ds-success-tint'],
		TEXT,
		'text on a tinted ground'
	);
	add('ds-accent-text', ['ds-bg-1', 'ds-bg-3', 'ds-accent-tint'], TEXT, 'accent at body size');
	add(
		'ds-accent-contrast',
		['ds-accent', 'ds-accent-strong', 'ds-accent-text', 'ds-accent-key'],
		TEXT,
		'label on a filled accent (rest, hover, pressed, key cap)'
	);
	add('ds-warning-contrast', ['ds-warning-fill'], TEXT, 'text on a solid caution ground');
	add(
		'ds-danger-contrast',
		['ds-danger-fill', 'ds-danger-strong'],
		TEXT,
		'label on a solid danger button'
	);
	for (const r of ['success', 'warning', 'danger'])
		add(`ds-${r}-text`, ['ds-bg-1', 'ds-bg-3', `ds-${r}-tint`], TEXT, `${r} text`);
	for (const s of severities) {
		add(`ds-sev-${s}-ink`, [`ds-sev-${s}-bg`], TEXT, `severity ${s} ink`);
		add(`ds-sev-${s}`, bgs(1, 2, 3), MARK, `severity ${s} mark`);
	}
	add('ds-focus', bgs(0, 1, 2, 3, 4), MARK, 'focus ring');
	add('ds-accent', bgs(1, 2, 3), MARK, 'accent mark');
	for (const r of ['success', 'warning', 'danger'])
		add(`ds-${r}`, bgs(1, 2, 3, 4), MARK, `${r} mark`);
	for (let i = 1; i <= 5; i++) add(`ds-cat-${i}`, bgs(1, 2, 4), MARK, `categorical ${i}`);
	add('ds-border-subtle', bgs(1, 2), MARK, 'hairline');
	add('ds-border', bgs(1, 3), MARK, 'control edge');
	add('ds-border-strong', bgs(4), MARK, 'secondary button edge');
	add('ds-accent-mixed', bgs(3), MARK, 'mixed chip edge');
	add('ds-on-media', ['ds-media-scrim'], TEXT, 'text over an image, on its scrim');
	add('ds-accent-2', bgs(1, 2, 3, 4), MARK, 'second color mark');
	add('ds-accent-2-text', bgs(1, 2, 3), TEXT, 'second color text');
	add('ds-text-1', ['ds-accent-2-tint'], TEXT, 'text on the second color tint');
	// The navigation chrome: its own grounds, text and accent, wherever a brand puts them.
	// The rail sits on bg-0 with hover bg-2 and the current item on bg-4; the bars sit on bg-2.
	const chrome = (x, ground, raised) => {
		const g = (n) => n.map((i) => `ds-${x}-bg-${i}`);
		add(`ds-${x}-text-1`, g([ground, ...raised]), TEXT, `${x} primary text`);
		add(`ds-${x}-text-2`, g([ground, ...raised]), TEXT, `${x} secondary text`);
		add(`ds-${x}-text-3`, g([ground]), TEXT, `${x} muted text`);
		add(`ds-${x}-accent`, g([ground, raised.at(-1)]), MARK, `${x} active mark`);
		add(`ds-${x}-accent-text`, g([ground]), TEXT, `${x} accent text`);
	};
	chrome('rail', 0, [2, 4]);
	chrome('bar', 2, [3, 4]);
	return pairs;
}

// Documented in the README's Accessibility section; the lint check fails if one starts passing
// everywhere, so the README cannot go stale. `fg|bg|theme`, or `fg|bg|*` for a pair that falls
// short by design in every mode but high contrast, which exists to close these gaps.
export const SHORTFALLS = new Set([
	'ds-border-subtle|ds-bg-1|*',
	'ds-border-subtle|ds-bg-2|*',
	'ds-border|ds-bg-1|*',
	'ds-border|ds-bg-3|*',
	'ds-border-strong|ds-bg-4|*',
	'ds-sev-critical|ds-bg-1|dark',
	'ds-sev-critical|ds-bg-2|dark',
	'ds-sev-critical|ds-bg-3|dark',
	'ds-sev-critical|ds-bg-2|night',
	'ds-sev-critical|ds-bg-3|night',
	'ds-accent-mixed|ds-bg-3|dark'
]);

export const isShortfall = (fg, bg, theme) =>
	theme !== 'contrast' &&
	(SHORTFALLS.has(`${fg}|${bg}|${theme}`) || SHORTFALLS.has(`${fg}|${bg}|*`));

export const targetFor = (target, theme, family) => target[theme] ?? target[family] ?? 4.5;

/** Each pair's ratio in one mode, given a function from role name to color. */
export function evaluate(pairs, value, theme, family) {
	return pairs.map((p) => {
		const ratio = contrastOn(value(p.fg), value(p.bg));
		const need = targetFor(p.target, theme, family);
		return { ...p, ratio, need, ok: ratio >= need, shortfall: isShortfall(p.fg, p.bg, theme) };
	});
}
