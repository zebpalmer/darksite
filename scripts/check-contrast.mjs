// Checks every color pair the system documents against its WCAG 2.1 contrast target, in every
// theme. Run in lint, so a color change cannot silently break a pair or make the README untrue.
//   node scripts/check-contrast.mjs        print failures and documented shortfalls
//   node scripts/check-contrast.mjs -v     also print every pair
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
const themes = tokens.color.themes.map((t) => t.id);
const first = themes[0];
const byName = Object.fromEntries(tokens.color.tokens.map((t) => [t.name, t.value]));

function resolve(name, theme, depth = 0) {
	const v = byName[name];
	if (v === undefined) throw new Error(`unknown token ${name}`);
	const raw = typeof v === 'string' ? v : (v[theme] ?? v[first]);
	const alias = /^\{(.+)\}$/.exec(raw);
	return alias && depth < 16 ? resolve(alias[1], theme, depth + 1) : raw;
}
function luminance(hex) {
	const h = hex.replace('#', '');
	const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
	const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) {
	const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
	return (x + 0.05) / (y + 0.05);
}

const TEXT = { dark: 4.5, light: 4.5, contrast: 7 };
const MARK = { dark: 3, light: 3, contrast: 3 };
const bgs = (...n) => n.map((i) => `ds-bg-${i}`);
const pairs = [];
const add = (fg, grounds, target, why) =>
	grounds.forEach((bg) => pairs.push({ fg, bg, target, why }));

add('ds-text-1', bgs(1, 2, 3, 4, 5), TEXT, 'primary text');
add('ds-text-2', bgs(1, 2, 3, 4), TEXT, 'secondary text');
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
add(
	'ds-danger-contrast',
	['ds-danger-fill', 'ds-danger-strong'],
	TEXT,
	'label on a solid danger button'
);
for (const r of ['success', 'warning', 'danger'])
	add(`ds-${r}-text`, ['ds-bg-1', 'ds-bg-3', `ds-${r}-tint`], TEXT, `${r} text`);
for (const s of ['info', 'low', 'medium', 'high', 'critical']) {
	add(`ds-sev-${s}-ink`, [`ds-sev-${s}-bg`], TEXT, `severity ${s} ink`);
	add(`ds-sev-${s}`, bgs(1, 3), MARK, `severity ${s} mark`);
}
add('ds-focus', bgs(0, 1, 2, 3, 4), MARK, 'focus ring');
add('ds-accent', ['ds-bg-1', 'ds-bg-3'], MARK, 'accent mark');
for (const r of ['success', 'warning', 'danger'])
	add(`ds-${r}`, bgs(1, 2, 3, 4), MARK, `${r} mark`);
for (let i = 1; i <= 5; i++) add(`ds-cat-${i}`, bgs(2, 4), MARK, `categorical ${i}`);
add('ds-border-subtle', bgs(1, 2), MARK, 'hairline');
add('ds-border', bgs(1, 3), MARK, 'control edge');
add('ds-border-strong', bgs(4), MARK, 'secondary button edge');
add('ds-accent-mixed', bgs(3), MARK, 'mixed chip edge');

// Documented in the README's Accessibility section. Each must still fail, or it should be removed.
const SHORTFALLS = new Set([
	'ds-border-subtle|ds-bg-1|dark',
	'ds-border-subtle|ds-bg-2|dark',
	'ds-border-subtle|ds-bg-1|light',
	'ds-border-subtle|ds-bg-2|light',
	'ds-border|ds-bg-1|dark',
	'ds-border|ds-bg-3|dark',
	'ds-border|ds-bg-1|light',
	'ds-border|ds-bg-3|light',
	'ds-border-strong|ds-bg-4|dark',
	'ds-border-strong|ds-bg-4|light',
	'ds-sev-critical|ds-bg-1|dark',
	'ds-sev-critical|ds-bg-3|dark',
	'ds-accent-mixed|ds-bg-3|dark'
]);

const verbose = process.argv.includes('-v');
let failures = 0;
const notes = [];
const stale = new Set(SHORTFALLS);
for (const theme of themes) {
	for (const { fg, bg, target, why } of pairs) {
		const r = ratio(resolve(fg, theme), resolve(bg, theme));
		const need = target[theme] ?? target[first];
		const key = `${fg}|${bg}|${theme}`;
		const ok = r >= need;
		if (SHORTFALLS.has(key)) {
			if (ok)
				(console.error(
					`STALE  ${key} now passes (${r.toFixed(2)}) — remove it from the shortfall list and the README`
				),
					failures++);
			else
				notes.push(`${theme.padEnd(8)} ${fg} on ${bg}: ${r.toFixed(2)} (needs ${need}) — ${why}`);
			stale.delete(key);
		} else if (!ok) {
			console.error(`FAIL   ${theme.padEnd(8)} ${fg} on ${bg}: ${r.toFixed(2)} < ${need} — ${why}`);
			failures++;
		} else if (verbose) {
			console.log(`ok     ${theme.padEnd(8)} ${fg} on ${bg}: ${r.toFixed(2)}`);
		}
	}
}
for (const key of stale)
	(console.error(`STALE  ${key} is listed as a shortfall but no longer checked`), failures++);
if (notes.length) console.log(`Documented shortfalls (${notes.length}):\n  ` + notes.join('\n  '));
console.log(
	failures
		? `${failures} contrast failure(s).`
		: `Contrast: ${pairs.length} pairs × ${themes.length} themes pass.`
);
process.exit(failures ? 1 : 0);
