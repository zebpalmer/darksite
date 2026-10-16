// Checks every color pair the system documents against its WCAG 2.1 contrast target, in every
// mode. Run in lint, so a color change cannot silently break a pair or make the README untrue.
//   node scripts/check-contrast.mjs        print failures and documented shortfalls
//   node scripts/check-contrast.mjs -v     also print every pair
// The pairs and the shortfall list live in brand/contrast.mjs, shared with the brand generator.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildPairs, evaluate, SHORTFALLS } from '../brand/contrast.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
const themes = tokens.color.themes;
const first = themes[0].id;
const byName = Object.fromEntries(tokens.color.tokens.map((t) => [t.name, t.value]));

function resolve(name, theme, depth = 0) {
	const v = byName[name];
	if (v === undefined) throw new Error(`unknown token ${name}`);
	// A theme that extends another falls back to it, then to the default theme, as tokens.css does.
	const base = themes.find((t) => t.id === theme)?.extends;
	const raw = typeof v === 'string' ? v : (v[theme] ?? (base ? v[base] : undefined) ?? v[first]);
	const alias = /^\{(.+)\}$/.exec(raw);
	return alias && depth < 16 ? resolve(alias[1], theme, depth + 1) : raw;
}

// The built-in severity scale (src/lib/severity.ts) is the one ordinal-scale instance whose colors
// darksite owns: read its stops from the module, so a new stop cannot go unchecked. Apps check
// their own scales with checkScaleContrast (docs/severity.md, "Custom scales").
const severitySource = readFileSync(join(root, 'src/lib/severity.ts'), 'utf8');
const severities = [
	.../SEVERITIES = \[([^\]]+)\]/.exec(severitySource)[1].matchAll(/'([a-z]+)'/g)
].map((m) => m[1]);
if (!severities.length) throw new Error('no severity stops found in src/lib/severity.ts');
const pairs = buildPairs(severities);

const verbose = process.argv.includes('-v');
let failures = 0;
const notes = [];
const stale = new Set(SHORTFALLS);
for (const { id: theme, extends: base } of themes) {
	const family = base ?? (theme === first ? first : 'light');
	for (const r of evaluate(pairs, (n) => resolve(n, theme), theme, family)) {
		const line = `${theme.padEnd(8)} ${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)}`;
		if (r.shortfall) {
			if (!r.ok) {
				notes.push(`${line} (needs ${r.need}) — ${r.why}`);
				stale.delete(`${r.fg}|${r.bg}|${theme}`);
				stale.delete(`${r.fg}|${r.bg}|*`);
			}
		} else if (!r.ok) {
			console.error(`FAIL   ${line} < ${r.need} — ${r.why}`);
			failures++;
		} else if (verbose) console.log(`ok     ${line}`);
	}
}
for (const key of stale)
	(console.error(
		`STALE  ${key} is listed as a shortfall but passes everywhere — remove it and its README note`
	),
		failures++);
if (notes.length) console.log(`Documented shortfalls (${notes.length}):\n  ` + notes.join('\n  '));
console.log(
	failures
		? `${failures} contrast failure(s).`
		: `Contrast: ${pairs.length} pairs × ${themes.length} themes pass.`
);
process.exit(failures ? 1 : 0);
